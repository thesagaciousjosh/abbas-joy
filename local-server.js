const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const {
  BlobNotFoundError,
  head: headBlob,
  put: putBlob
} = require('@vercel/blob');

const PORT = Number(process.env.PORT) || 5510;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_VERCEL = process.env.VERCEL === '1';
const DEFAULT_ADMIN_PASSWORD = 'change-this-password';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY || '';
const SESSION_SECRET = process.env.SESSION_SECRET || ADMIN_PASSWORD;
const ROOT = path.resolve(__dirname);
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const DATA_FILE = path.join(DATA_DIR, 'blog.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SEED_DATA_FILE = path.join(ROOT, 'data', 'blog.json');
const USE_BLOB_STORAGE = IS_VERCEL || process.env.USE_VERCEL_BLOB === '1';
const BLOG_DATA_BLOB = 'abbas-joy/data/blog.json';
const AUTH_DATA_BLOB = 'abbas-joy/private/admin-auth.json.enc';
const DEFAULT_CATEGORIES = ['Faith', 'Reflection', 'Education', 'Story', 'Inclusion', 'Music'];
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_ATTEMPT_LIMIT = 8;
const MIN_PASSWORD_LENGTH = 12;
const MAX_BODY_BYTES = 1_000_000;
const MAX_UPLOAD_BYTES = 3_000_000;
const MAX_UPLOAD_REQUEST_BYTES = 4_200_000;
const sessions = new Map();
const rateLimits = new Map();
const LOCAL_PREVIEW_ORIGINS = new Set([
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function hasBlobStorageAccess() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN
    || process.env.VERCEL_OIDC_TOKEN
    || (IS_VERCEL && process.env.BLOB_STORE_ID)
  );
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

const PUBLIC_FILES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/blog.html', 'blog.html'],
  ['/post.html', 'post.html'],
  ['/admin.html', 'admin.html'],
  ['/robots.txt', 'robots.txt'],
  ['/style.css', 'style.css'],
  ['/script.js', 'script.js']
]);

const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' https://fonts.gstatic.com",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com"
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

function setSecurityHeaders(response) {
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    response.setHeader(name, value);
  });
}

function setLocalPreviewCors(request, response) {
  const origin = request.headers.origin;
  if (IS_PRODUCTION || !LOCAL_PREVIEW_ORIGINS.has(origin)) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Admin-Password');
  response.setHeader('Vary', 'Origin');
  return true;
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureDataFile() {
  ensureDataDirectory();
  if (!fs.existsSync(DATA_FILE)) {
    const seedData = DATA_FILE !== SEED_DATA_FILE && fs.existsSync(SEED_DATA_FILE)
      ? JSON.parse(fs.readFileSync(SEED_DATA_FILE, 'utf8'))
      : { categories: DEFAULT_CATEGORIES, posts: [] };
    writeLocalData(seedData);
  }
}

function ensureAuthFile() {
  ensureDataDirectory();
  if (!fs.existsSync(AUTH_FILE)) {
    writeAuth(createPasswordRecord(ADMIN_PASSWORD));
  }
}

function normalizeData(value) {
  const data = value && typeof value === 'object' ? value : {};
  data.categories = [...new Set([...DEFAULT_CATEGORIES, ...(data.categories || [])])];
  data.posts = Array.isArray(data.posts) ? data.posts : [];
  return data;
}

function readSeedData() {
  return normalizeData(
    fs.existsSync(SEED_DATA_FILE)
      ? JSON.parse(fs.readFileSync(SEED_DATA_FILE, 'utf8'))
      : { categories: DEFAULT_CATEGORIES, posts: [] }
  );
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function writeLocalData(data) {
  ensureDataDirectory();
  writeJson(DATA_FILE, data);
}

async function readPublicBlob(pathname) {
  const metadata = await headBlob(pathname);
  const response = await fetch(
    `${metadata.url}?version=${encodeURIComponent(metadata.etag)}`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new Error(`Unable to read Vercel Blob data (${response.status})`);
  }
  return response.text();
}

async function writePublicBlob(pathname, value, contentType) {
  return putBlob(pathname, value, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType
  });
}

async function readData() {
  if (!USE_BLOB_STORAGE) {
    ensureDataFile();
    return normalizeData(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  }

  if (!hasBlobStorageAccess()) {
    return readSeedData();
  }

  try {
    return normalizeData(JSON.parse(await readPublicBlob(BLOG_DATA_BLOB)));
  } catch (error) {
    if (error instanceof BlobNotFoundError) return readSeedData();
    throw error;
  }
}

async function writeData(data) {
  if (!USE_BLOB_STORAGE) {
    writeLocalData(data);
    return;
  }

  await writePublicBlob(
    BLOG_DATA_BLOB,
    `${JSON.stringify(normalizeData(data), null, 2)}\n`,
    'application/json'
  );
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 210000, 64, 'sha512').toString('hex');
  return {
    salt,
    hash,
    iterations: 210000,
    updatedAt: new Date().toISOString()
  };
}

function encryptAuthRecord(auth) {
  const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(auth), 'utf8'),
    cipher.final()
  ]);
  return JSON.stringify({
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    data: encrypted.toString('base64url')
  });
}

function decryptAuthRecord(payload) {
  const record = JSON.parse(payload);
  const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(record.iv, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(record.tag, 'base64url'));
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(record.data, 'base64url')),
    decipher.final()
  ]).toString('utf8'));
}

async function readAuth() {
  if (!USE_BLOB_STORAGE) {
    ensureAuthFile();
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  }

  try {
    return decryptAuthRecord(await readPublicBlob(AUTH_DATA_BLOB));
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      const auth = createPasswordRecord(ADMIN_PASSWORD);
      await writeAuth(auth);
      return auth;
    }
    throw error;
  }
}

async function writeAuth(auth) {
  if (!USE_BLOB_STORAGE) {
    ensureDataDirectory();
    writeJson(AUTH_FILE, auth);
    return;
  }

  await writePublicBlob(
    AUTH_DATA_BLOB,
    encryptAuthRecord(auth),
    'application/octet-stream'
  );
}

async function isPasswordMatch(password, auth) {
  try {
    const passwordRecord = auth || await readAuth();
    const iterations = Number(passwordRecord.iterations) || 120000;
    const actual = crypto.pbkdf2Sync(
      String(password || ''),
      passwordRecord.salt,
      iterations,
      64,
      'sha512'
    );
    const expected = Buffer.from(passwordRecord.hash, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function isSecretMatch(actual, expected) {
  const actualHash = crypto.createHash('sha256').update(String(actual)).digest();
  const expectedHash = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

async function validateProductionConfiguration() {
  if (!IS_PRODUCTION) return;

  if (ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD must be set to a strong, unique value in production.');
  }

  if (SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production.');
  }

  if (USE_BLOB_STORAGE && !hasBlobStorageAccess()) {
    throw new Error('Connect a public Vercel Blob store before using the production admin.');
  }

  if (!USE_BLOB_STORAGE && fs.existsSync(AUTH_FILE) && await isPasswordMatch(DEFAULT_ADMIN_PASSWORD)) {
    throw new Error('The default admin password must be changed before production.');
  }

  if (ADMIN_RESET_KEY && ADMIN_RESET_KEY.length < 20) {
    throw new Error('ADMIN_RESET_KEY must be at least 20 characters in production.');
  }
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  const hasBody = statusCode !== 204 && statusCode !== 304;
  const body = hasBody ? Buffer.from(JSON.stringify(payload)) : Buffer.alloc(0);
  setSecurityHeaders(response);
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': MIME_TYPES['.json'],
    ...(hasBody ? { 'Content-Length': body.length } : {}),
    ...extraHeaders
  });
  response.end(body);
}

function readRequestBody(request, maxBytes = MAX_BODY_BYTES) {
  if (request.body !== undefined && request.body !== null) {
    return Promise.resolve().then(() => {
      const rawBody = Buffer.isBuffer(request.body)
        ? request.body.toString('utf8')
        : typeof request.body === 'string'
          ? request.body
          : JSON.stringify(request.body);
      if (Buffer.byteLength(rawBody) > maxBytes) {
        const error = new Error('Request body too large');
        error.statusCode = 413;
        throw error;
      }
      try {
        return rawBody ? JSON.parse(rawBody) : {};
      } catch {
        const error = new Error('Request body must be valid JSON');
        error.statusCode = 400;
        throw error;
      }
    });
  }

  return new Promise((resolve, reject) => {
    let body = '';
    let settled = false;

    request.on('data', chunk => {
      if (settled) return;
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) {
        settled = true;
        const error = new Error('Request body too large');
        error.statusCode = 413;
        reject(error);
      }
    });

    request.on('end', () => {
      if (settled) return;
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        const error = new Error('Request body must be valid JSON');
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function getClientIp(request) {
  return String(request.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || request.socket?.remoteAddress
    || 'unknown';
}

function consumeRateLimit(request, response, scope, limit = AUTH_ATTEMPT_LIMIT) {
  const now = Date.now();
  const key = `${scope}:${getClientIp(request)}`;
  const current = rateLimits.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + AUTH_WINDOW_MS }
    : current;

  bucket.count += 1;
  rateLimits.set(key, bucket);

  if (bucket.count <= limit) return true;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  sendJson(
    response,
    429,
    { error: 'Too many attempts. Please try again later.' },
    { 'Retry-After': retryAfter }
  );
  return false;
}

function clearRateLimit(request, scope) {
  rateLimits.delete(`${scope}:${getClientIp(request)}`);
}

function pruneSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function createSession() {
  if (USE_BLOB_STORAGE) {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = Buffer.from(JSON.stringify({ expiresAt })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');
    return {
      token: `${payload}.${signature}`,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  pruneSessions();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, { expiresAt });
  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

async function isAdminPassword(password) {
  return isPasswordMatch(String(password || '').trim());
}

function isSignedSessionValid(token) {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return false;
    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(session.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

async function isAuthorized(request) {
  const token = getBearerToken(request);
  if (token) {
    if (USE_BLOB_STORAGE && isSignedSessionValid(token)) return true;
    if (!USE_BLOB_STORAGE) {
      pruneSessions();
      if (sessions.has(token)) return true;
    }
  }

  return isAdminPassword(request.headers['x-admin-password']);
}

async function requireAuth(request, response) {
  if (await isAuthorized(request)) return true;
  sendJson(
    response,
    401,
    { error: 'Unauthorized' },
    { 'WWW-Authenticate': 'Bearer realm="Abbas Joy admin"' }
  );
  return false;
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanImagePath(value) {
  const image = cleanText(value, 700).replaceAll('\\', '/');
  if (!image) return '';
  const normalized = image.replace(/^\//, '');
  const isBundledAsset = /^assets\/[a-z0-9][a-z0-9._%/ -]*$/i.test(normalized);
  const isUploadedImage = /^uploads\/[a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp)$/i.test(normalized);
  const isVercelBlobImage = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[a-z0-9][a-z0-9._~!$&'()*+,;=:@%/-]*\.(?:jpe?g|png|webp)(?:\?[a-z0-9._~!$&'()*+,;=:@%/?-]*)?$/i.test(image);
  return isVercelBlobImage ? image : isBundledAsset || isUploadedImage ? normalized : '';
}

function detectImageType(buffer) {
  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer.subarray(1, 4).toString('ascii') === 'PNG'
    && buffer[4] === 0x0d
    && buffer[5] === 0x0a
    && buffer[6] === 0x1a
    && buffer[7] === 0x0a
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }

  if (
    buffer.length >= 12
    && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }

  return null;
}

async function saveUploadedImage(payload) {
  const match = String(payload.dataUrl || '').match(
    /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/]+={0,2})$/i
  );
  if (!match) {
    const error = new Error('Upload must be a JPG, PNG, or WebP image');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
    const error = new Error('Optimized image must be 3 MB or smaller');
    error.statusCode = 413;
    throw error;
  }

  const imageType = detectImageType(buffer);
  if (!imageType || imageType.mimeType !== match[1].toLowerCase()) {
    const error = new Error('Image content does not match its file type');
    error.statusCode = 400;
    throw error;
  }

  const originalBaseName = path.basename(String(payload.fileName || 'blog-image'), path.extname(String(payload.fileName || '')));
  const safeBaseName = originalBaseName
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase() || 'blog-image';
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeBaseName}.${imageType.extension}`;

  if (USE_BLOB_STORAGE) {
    const blob = await putBlob(`abbas-joy/uploads/${fileName}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 31_536_000,
      contentType: imageType.mimeType
    });
    return {
      path: blob.url,
      mimeType: imageType.mimeType,
      size: buffer.length
    };
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), buffer, { mode: 0o600, flag: 'wx' });
  return {
    path: `uploads/${fileName}`,
    mimeType: imageType.mimeType,
    size: buffer.length
  };
}

function sanitizePost(input) {
  const now = new Date().toISOString();
  const id = cleanText(input.id, 200) || `post-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  return {
    id,
    title: cleanText(input.title, 160),
    category: cleanText(input.category || 'Reflection', 50),
    date: cleanText(input.date || new Date().toLocaleDateString('en-US'), 100),
    dateValue: cleanText(input.dateValue, 20),
    timeValue: cleanText(input.timeValue, 20),
    image: cleanImagePath(input.image),
    imageAlt: cleanText(input.imageAlt, 300),
    quote: cleanText(input.quote || input.excerpt, 600),
    excerpt: cleanText(input.excerpt, 600),
    body: cleanText(input.body, 150000),
    bodyHtml: cleanText(input.bodyHtml, 200000),
    createdAt: input.createdAt || now,
    updatedAt: now
  };
}

function upsertCategory(data, category) {
  if (!data.categories.some(item => item.toLowerCase() === category.toLowerCase())) {
    data.categories.push(category);
  }
}

async function handleApi(request, response, url) {
  const requiresAdminConfiguration = (
    (url.pathname === '/api/auth' && request.method !== 'OPTIONS')
    || url.pathname.startsWith('/api/password/')
    || url.pathname === '/api/uploads'
    || (url.pathname.startsWith('/api/posts') && !['GET', 'OPTIONS'].includes(request.method))
    || (url.pathname.startsWith('/api/categories') && !['GET', 'OPTIONS'].includes(request.method))
  );

  if (IS_PRODUCTION && requiresAdminConfiguration) {
    await validateProductionConfiguration();
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      adminConfigured: (
        ADMIN_PASSWORD !== DEFAULT_ADMIN_PASSWORD
        && SESSION_SECRET.length >= 32
        && (!USE_BLOB_STORAGE || hasBlobStorageAccess())
      )
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/config') {
    sendJson(response, 200, { resetEnabled: Boolean(ADMIN_RESET_KEY) });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth') {
    if (!consumeRateLimit(request, response, 'login')) return true;
    const payload = await readRequestBody(request);
    const password = payload.password || request.headers['x-admin-password'];
    if (!await isAdminPassword(password)) {
      sendJson(response, 401, { error: 'Unauthorized' });
      return true;
    }
    clearRateLimit(request, 'login');
    sendJson(response, 200, { ok: true, session: createSession() });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth') {
    if (!await requireAuth(request, response)) return true;
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/auth') {
    const token = getBearerToken(request);
    if (token) sessions.delete(token);
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/password/change') {
    if (!consumeRateLimit(request, response, 'password-change', 5)) return true;
    const payload = await readRequestBody(request);
    const currentPassword = String(payload.currentPassword || '').trim();
    const newPassword = String(payload.newPassword || '').trim();
    if (!await isAdminPassword(currentPassword)) {
      sendJson(response, 401, { error: 'Current password is incorrect' });
      return true;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      sendJson(response, 400, { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return true;
    }
    await writeAuth(createPasswordRecord(newPassword));
    sessions.clear();
    clearRateLimit(request, 'password-change');
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/password/reset') {
    if (!consumeRateLimit(request, response, 'password-reset', 5)) return true;
    const payload = await readRequestBody(request);
    const resetKey = String(payload.resetKey || '').trim();
    const newPassword = String(payload.newPassword || '').trim();
    if (!ADMIN_RESET_KEY) {
      sendJson(response, 400, { error: 'Password reset is not configured' });
      return true;
    }
    if (!isSecretMatch(resetKey, ADMIN_RESET_KEY)) {
      sendJson(response, 401, { error: 'Reset key is incorrect' });
      return true;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      sendJson(response, 400, { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return true;
    }
    await writeAuth(createPasswordRecord(newPassword));
    sessions.clear();
    clearRateLimit(request, 'password-reset');
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/uploads') {
    if (!await requireAuth(request, response)) return true;
    const payload = await readRequestBody(request, MAX_UPLOAD_REQUEST_BYTES);
    sendJson(response, 201, await saveUploadedImage(payload));
    return true;
  }

  const data = await readData();

  if (request.method === 'GET' && url.pathname === '/api/posts') {
    sendJson(response, 200, data.posts);
    return true;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/posts/')) {
    const id = decodeURIComponent(url.pathname.slice('/api/posts/'.length));
    const post = data.posts.find(item => item.id === id);
    sendJson(response, post ? 200 : 404, post || { error: 'Post not found' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/posts') {
    if (!await requireAuth(request, response)) return true;
    const post = sanitizePost(await readRequestBody(request));
    if (!post.title || !post.body) {
      sendJson(response, 400, { error: 'Title and body are required' });
      return true;
    }
    data.posts.unshift(post);
    upsertCategory(data, post.category);
    await writeData(data);
    sendJson(response, 201, post);
    return true;
  }

  if (request.method === 'PUT' && url.pathname.startsWith('/api/posts/')) {
    if (!await requireAuth(request, response)) return true;
    const id = decodeURIComponent(url.pathname.slice('/api/posts/'.length));
    const existingIndex = data.posts.findIndex(item => item.id === id);
    if (existingIndex === -1) {
      sendJson(response, 404, { error: 'Post not found' });
      return true;
    }

    const payload = await readRequestBody(request);
    const post = sanitizePost({
      ...data.posts[existingIndex],
      ...payload,
      id,
      createdAt: data.posts[existingIndex].createdAt
    });
    if (!post.title || !post.body) {
      sendJson(response, 400, { error: 'Title and body are required' });
      return true;
    }

    data.posts[existingIndex] = post;
    upsertCategory(data, post.category);
    await writeData(data);
    sendJson(response, 200, post);
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/posts/')) {
    if (!await requireAuth(request, response)) return true;
    const id = decodeURIComponent(url.pathname.slice('/api/posts/'.length));
    if (!data.posts.some(item => item.id === id)) {
      sendJson(response, 404, { error: 'Post not found' });
      return true;
    }
    await writeData({ ...data, posts: data.posts.filter(item => item.id !== id) });
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/categories') {
    sendJson(response, 200, data.categories);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/categories') {
    if (!await requireAuth(request, response)) return true;
    const payload = await readRequestBody(request);
    const category = cleanText(payload.category, 50);
    if (!category) {
      sendJson(response, 400, { error: 'Category is required' });
      return true;
    }
    if (!data.categories.some(item => item.toLowerCase() === category.toLowerCase())) {
      data.categories.push(category);
      await writeData(data);
    }
    sendJson(response, 201, data.categories);
    return true;
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/categories/')) {
    if (!await requireAuth(request, response)) return true;
    const category = decodeURIComponent(url.pathname.slice('/api/categories/'.length));
    const inUse = data.posts.some(post => post.category === category);
    if (DEFAULT_CATEGORIES.includes(category) || inUse) {
      sendJson(response, 400, { error: 'Category cannot be deleted' });
      return true;
    }
    await writeData({ ...data, categories: data.categories.filter(item => item !== category) });
    sendJson(response, 200, { ok: true });
    return true;
  }

  return false;
}

function resolvePublicFile(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  if (PUBLIC_FILES.has(pathname)) {
    return path.join(ROOT, PUBLIC_FILES.get(pathname));
  }

  if (pathname.startsWith('/assets/')) {
    const assetPath = path.resolve(ROOT, `.${pathname}`);
    const assetsRoot = path.join(ROOT, 'assets');
    const relativePath = path.relative(assetsRoot, assetPath);
    if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return null;
    }
    return assetPath;
  }

  if (pathname.startsWith('/uploads/')) {
    const uploadPath = path.resolve(UPLOADS_DIR, `.${pathname.slice('/uploads'.length)}`);
    const relativePath = path.relative(UPLOADS_DIR, uploadPath);
    if (
      !relativePath
      || relativePath.startsWith('..')
      || path.isAbsolute(relativePath)
      || !/\.(?:jpe?g|png|webp)$/i.test(relativePath)
    ) {
      return null;
    }
    return uploadPath;
  }

  return null;
}

function compressStatic(content, request, mimeType) {
  if (!/^(text\/|application\/(javascript|json))/.test(mimeType)) {
    return { content, encoding: null };
  }

  const accepted = request.headers['accept-encoding'] || '';
  if (/\bbr\b/.test(accepted)) {
    return { content: zlib.brotliCompressSync(content), encoding: 'br' };
  }
  if (/\bgzip\b/.test(accepted)) {
    return { content: zlib.gzipSync(content), encoding: 'gzip' };
  }
  return { content, encoding: null };
}

function serveStatic(request, response, url) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    sendJson(response, 405, { error: 'Method not allowed' }, { Allow: 'GET, HEAD' });
    return;
  }

  const filePath = resolvePublicFile(url.pathname);
  if (!filePath) {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[extension] || 'application/octet-stream';
    const etag = `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
    const isHtml = extension === '.html';
    const isCode = isHtml || extension === '.css' || extension === '.js';
    const isAsset = filePath.startsWith(`${path.join(ROOT, 'assets')}${path.sep}`);
    const isUpload = filePath.startsWith(`${UPLOADS_DIR}${path.sep}`);

    setSecurityHeaders(response);
    if (isUpload) {
      response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    response.setHeader(
      'Cache-Control',
      !IS_PRODUCTION && isCode
        ? 'no-store'
        : isHtml
          ? 'no-cache'
          : isAsset || isUpload
            ? 'public, max-age=604800'
            : 'public, max-age=3600'
    );
    response.setHeader('Content-Type', mimeType);
    response.setHeader('ETag', etag);
    response.setHeader('Last-Modified', stats.mtime.toUTCString());

    if (request.headers['if-none-match'] === etag) {
      response.writeHead(304);
      response.end();
      return;
    }

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        sendJson(response, 500, { error: 'Unable to read file' });
        return;
      }

      const compressed = compressStatic(content, request, mimeType);
      if (compressed.encoding) {
        response.setHeader('Content-Encoding', compressed.encoding);
        response.setHeader('Vary', 'Accept-Encoding');
      }
      response.setHeader('Content-Length', compressed.content.length);
      response.writeHead(200);
      response.end(request.method === 'HEAD' ? undefined : compressed.content);
    });
  });
}

async function handleRequest(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const isLocalPreviewRequest = setLocalPreviewCors(request, response);
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      if (!isLocalPreviewRequest) {
        sendJson(response, 403, { error: 'Cross-origin request is not allowed' });
        return;
      }
      sendJson(response, 204, {});
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApi(request, response, url);
      if (!handled) sendJson(response, 404, { error: 'API route not found' });
      return;
    }
    serveStatic(request, response, url);
  } catch (error) {
    const statusCode = Number(error.statusCode) || 500;
    if (statusCode >= 500) {
      console.error('Request failed:', error);
    }
    sendJson(response, statusCode, {
      error: statusCode >= 500 && IS_PRODUCTION ? 'Server error' : error.message || 'Server error'
    });
  }
}

const server = http.createServer(handleRequest);

async function startServer() {
  await validateProductionConfiguration();
  if (!USE_BLOB_STORAGE) {
    ensureDataFile();
    ensureAuthFile();
  }
  server.listen(PORT, () => {
    console.log(`Abba's Joy running at http://localhost:${PORT}`);
    if (!IS_PRODUCTION) {
      isPasswordMatch(DEFAULT_ADMIN_PASSWORD).then(matches => {
        if (matches) {
          console.warn('Development warning: change the default admin password before deployment.');
        }
      });
    }
  });
}

if (require.main === module) {
  startServer().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { handleRequest, server, startServer };
