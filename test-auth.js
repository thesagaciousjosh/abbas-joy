const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { after, before, test } = require('node:test');

const TEST_PASSWORD = 'test-password-strong';
let baseUrl;
let dataDirectory;
let serverProcess;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function waitForServer(url, timeoutMs = 8000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      const request = http.get(url, response => {
        response.resume();
        if (response.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });
      request.on('error', retry);
      request.setTimeout(500, () => request.destroy());
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Test server did not start in time'));
        return;
      }
      setTimeout(poll, 100);
    };

    poll();
  });
}

before(async () => {
  const port = await getAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'abbas-joy-test-'));
  serverProcess = spawn(process.execPath, ['local-server.js'], {
    cwd: __dirname,
    env: {
      ...process.env,
      ADMIN_PASSWORD: TEST_PASSWORD,
      DATA_DIR: dataDirectory,
      NODE_ENV: 'test',
      PORT: String(port)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverError = '';
  serverProcess.stderr.on('data', chunk => {
    serverError += chunk.toString();
  });
  serverProcess.once('exit', code => {
    if (code && serverError) process.stderr.write(serverError);
  });

  await waitForServer(`${baseUrl}/api/health`);
});

after(() => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
  if (dataDirectory) fs.rmSync(dataDirectory, { recursive: true, force: true });
});

test('serves the public site with security and cache headers', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(response.headers.get('content-security-policy'), /img-src 'self' data: blob:/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(html, /Abba.s Joy by Becca Etudaiye/);
});

test('does not expose private or server-side files', async () => {
  for (const privatePath of ['/data/auth.json', '/local-server.js', '/package.json', '/.admin-verification/server.js']) {
    const response = await fetch(`${baseUrl}${privatePath}`);
    assert.equal(response.status, 404, privatePath);
  }
});

test('allows the configured VS Code Live Server origin only in local development', async () => {
  const allowed = await fetch(`${baseUrl}/api/auth`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5500',
      'Access-Control-Request-Method': 'POST'
    }
  });
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5500');

  const denied = await fetch(`${baseUrl}/api/posts`, {
    headers: { Origin: 'https://example.com' }
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('only advertises password recovery when a reset key is configured', async () => {
  const response = await fetch(`${baseUrl}/api/auth/config`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { resetEnabled: false });
});

test('protects writes and supports post and category management', async () => {
  const unauthorized = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Blocked', body: 'Blocked' })
  });
  assert.equal(unauthorized.status, 401);

  const unauthorizedUpload = await fetch(`${baseUrl}/api/uploads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'blocked.png', dataUrl: 'data:image/png;base64,aGVsbG8=' })
  });
  assert.equal(unauthorizedUpload.status, 401);

  const login = await fetch(`${baseUrl}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: TEST_PASSWORD })
  });
  assert.equal(login.status, 200);
  const { session } = await login.json();
  assert.ok(session.token);
  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'Content-Type': 'application/json'
  };
  const initialPostsResponse = await fetch(`${baseUrl}/api/posts`);
  const initialPosts = await initialPostsResponse.json();

  const upload = await fetch(`${baseUrl}/api/uploads`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fileName: 'Featured Photo.png',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl9WQAAAABJRU5ErkJggg=='
    })
  });
  assert.equal(upload.status, 201);
  const uploadedImage = await upload.json();
  assert.match(uploadedImage.path, /^uploads\/[a-z0-9._-]+\.png$/);

  const publicImage = await fetch(`${baseUrl}/${uploadedImage.path}`);
  assert.equal(publicImage.status, 200);
  assert.equal(publicImage.headers.get('content-type'), 'image/png');
  assert.equal(publicImage.headers.get('cross-origin-resource-policy'), 'cross-origin');

  const updated = await fetch(`${baseUrl}/api/posts/post-1`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Updated original post' })
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).title, 'Updated original post');

  const removedOriginal = await fetch(`${baseUrl}/api/posts/post-4`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.token}` }
  });
  assert.equal(removedOriginal.status, 200);

  const created = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Release test',
      category: 'Faith',
      body: 'A tested post.',
      image: 'javascript:alert(1)'
    })
  });
  assert.equal(created.status, 201);
  const post = await created.json();
  assert.equal(post.image, '');

  const postWithImage = await fetch(`${baseUrl}/api/posts/${encodeURIComponent(post.id)}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ image: uploadedImage.path, imageAlt: 'Uploaded test image' })
  });
  assert.equal(postWithImage.status, 200);
  assert.equal((await postWithImage.json()).image, uploadedImage.path);

  const listed = await fetch(`${baseUrl}/api/posts`);
  const posts = await listed.json();
  assert.equal(posts.length, initialPosts.length);
  assert.equal(posts[0].title, 'Release test');

  const removed = await fetch(`${baseUrl}/api/posts/${encodeURIComponent(post.id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.token}` }
  });
  assert.equal(removed.status, 200);

  const categoryCreated = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ category: 'Test Category' })
  });
  assert.equal(categoryCreated.status, 201);
  assert.ok((await categoryCreated.json()).includes('Test Category'));

  const categoryRemoved = await fetch(`${baseUrl}/api/categories/Test%20Category`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.token}` }
  });
  assert.equal(categoryRemoved.status, 200);

  const afterRemoval = await fetch(`${baseUrl}/api/posts`);
  assert.equal((await afterRemoval.json()).length, initialPosts.length - 1);
});

test('rejects malformed JSON without exposing an internal error', async () => {
  const response = await fetch(`${baseUrl}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Request body must be valid JSON');
});
