const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MIN_PASSWORD_LENGTH = 12;
const root = path.resolve(__dirname, '..');
const dataDirectory = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const authFile = path.join(dataDirectory, 'auth.json');
const password = String(process.argv[2] || '').trim();

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exitCode = 1;
} else {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');
  const record = {
    salt,
    hash,
    iterations: 210000,
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(authFile, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
  console.log('Local admin password reset successfully.');
}
