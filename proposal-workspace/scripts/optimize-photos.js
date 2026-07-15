// Optimize all couple photos for web
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/home/z/my-project/upload';
const COUPLE_DIR = '/home/z/my-project/public/couple';

// All couple photos (old + new)
const photos = [
  'IMG_4026.jpeg',
  'IMG_4108.jpeg',
  'IMG_4424.jpeg',
  'IMG_2443.jpeg',
  'IMG_4068.jpeg',
  'IMG_4169.jpeg',
  'IMG_4456.jpeg',
  'IMG_9044.jpeg',
  'IMG_9687.jpeg',
];

async function optimize() {
  // Clear old photos
  fs.readdirSync(COUPLE_DIR).forEach(f => {
    fs.unlinkSync(path.join(COUPLE_DIR, f));
  });

  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const input = path.join(UPLOAD_DIR, file);
    const output = path.join(COUPLE_DIR, `photo-${i + 1}.jpg`);
    
    const metadata = await sharp(input).metadata();
    console.log(`${file}: ${metadata.width}x${metadata.height}, orientation=${metadata.orientation}`);
    
    // Resize to max 1200px on longest side, apply EXIF orientation
    await sharp(input, { failOnError: false })
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toFile(output);
    
    const stat = fs.statSync(output);
    console.log(`  → photo-${i + 1}.jpg: ${(stat.size / 1024).toFixed(0)} KB`);
  }
  
  console.log('\nFinal files:');
  for (const f of fs.readdirSync(COUPLE_DIR)) {
    const stat = fs.statSync(path.join(COUPLE_DIR, f));
    console.log(`  ${f}: ${(stat.size / 1024).toFixed(0)} KB`);
  }
}

optimize().catch(console.error);
