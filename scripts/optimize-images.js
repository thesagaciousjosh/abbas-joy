const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'assets');

async function replaceFile(temporaryPath, outputPath) {
  await fs.rm(outputPath, { force: true });
  await fs.rename(temporaryPath, outputPath);
}

const conversions = [
  {
    input: 'becca-portrait.jpg',
    output: 'becca-portrait.webp',
    resize: { width: 900, withoutEnlargement: true }
  },
  {
    input: 'becca-hero-v2.png',
    output: 'becca-hero-v2.webp',
    resize: { width: 900, withoutEnlargement: true }
  },
  {
    input: 'asl-tutoring-session.png',
    output: 'asl-tutoring-session.webp',
    resize: { width: 1200, withoutEnlargement: true }
  },
  ...[
    'service-asl-tutoring',
    'service-beginner-violin',
    'service-christian-content',
    'service-music-theory',
    'service-music-violin',
    'service-sign-interpretation',
    'service-social-media',
    'service-writing-content'
  ].map(name => ({
    input: `${name}.png`,
    output: `${name}.webp`,
    resize: { width: 1200, withoutEnlargement: true }
  }))
];

async function convert({ input, output, resize }) {
  const inputPath = path.join(assets, input);
  const outputPath = path.join(assets, output);
  const temporaryPath = `${outputPath}.tmp`;

  await sharp(inputPath)
    .rotate()
    .resize(resize)
    .webp({ quality: 82, effort: 6 })
    .toFile(temporaryPath);

  await replaceFile(temporaryPath, outputPath);
  const metadata = await sharp(outputPath).metadata();
  const stats = await fs.stat(outputPath);
  console.log(`${output}: ${metadata.width}x${metadata.height}, ${Math.round(stats.size / 1024)} KB`);
}

async function createIcon(input, output, size, quality) {
  const outputPath = path.join(assets, output);
  const temporaryPath = `${outputPath}.tmp`;

  await sharp(path.join(assets, input))
    .rotate()
    .resize(size, size, { fit: 'cover', position: 'north' })
    .jpeg({ quality, mozjpeg: true })
    .toFile(temporaryPath);

  await replaceFile(temporaryPath, outputPath);
}

async function main() {
  await Promise.all(conversions.map(convert));
  await Promise.all([
    createIcon('becca-hero-v2.png', 'favicon.jpg', 96, 82),
    createIcon('becca-hero-v2.png', 'apple-touch-icon.jpg', 180, 85)
  ]);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
