const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDirectory = path.join(root, 'public');
const publicFiles = [
  'admin.html',
  'blog.html',
  'index.html',
  'post.html',
  'robots.txt',
  'script.js',
  'style.css'
];

if (path.dirname(outputDirectory) !== root || path.basename(outputDirectory) !== 'public') {
  throw new Error('Refusing to build outside the project public directory');
}

fs.rmSync(outputDirectory, { force: true, recursive: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  fs.copyFileSync(path.join(root, file), path.join(outputDirectory, file));
}

fs.cpSync(path.join(root, 'assets'), path.join(outputDirectory, 'assets'), {
  recursive: true
});

console.log(`Prepared ${publicFiles.length} public files and the assets directory.`);
