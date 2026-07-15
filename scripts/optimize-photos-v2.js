// Optimize all couple photos for web
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/home/z/my-project/upload';
const COUPLE_DIR = '/home/z/my-project/public/couple';

// Map uploaded files to photo numbers
// Already have photo-1,2,3 from IMG_4026, IMG_4108, IMG_4424
// New: IMG_4068, IMG_9687, IMG_4456, IMG_4169, IMG_2443, IMG_9044 -> photo-4,5,6,7,8,9
const NEW_FILES = [
  { input: 'IMG_4068.jpeg', output: 'photo-4.jpg' },
  { input: 'IMG_9687.jpeg', output: 'photo-5.jpg' },
  { input: 'IMG_4456.jpeg', output: 'photo-6.jpg' },
  { input: 'IMG_4169.jpeg', output: 'photo-7.jpg' },
  { input: 'IMG_2443.jpeg', output: 'photo-8.jpg' },
  { input: 'IMG_9044.jpeg', output: 'photo-9.jpg' },
];

async function optimize() {
  for (const { input, output } of NEW_FILES) {
    const inputPath = path.join(UPLOAD_DIR, input);
    const outputPath = path.join(COUPLE_DIR, output);

    const metadata = await sharp(inputPath).metadata();
    console.log(`${input}: ${metadata.width}x${metadata.height}, orientation=${metadata.orientation}`);

    await sharp(inputPath, { failOnError: false })
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    console.log(`  → ${output}: ${(stat.size / 1024).toFixed(0)} KB`);
  }

  console.log('\nAll photos in couple directory:');
  for (const f of fs.readdirSync(COUPLE_DIR).sort()) {
    const stat = fs.statSync(path.join(COUPLE_DIR, f));
    console.log(`  ${f}: ${(stat.size / 1024).toFixed(0)} KB`);
  }
}

optimize().catch(console.error);
