/**
 * convert-photos.js — Convert couple photos to WebP format
 *
 * Uses sharp to convert JPEG photos to WebP with quality 82.
 * WebP typically achieves 25-35% smaller files than JPEG at the same
 * visual quality. The original JPEGs are kept as fallback.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const COUPLE_DIR = path.join(__dirname, '..', 'public', 'couple');

async function convertPhotos() {
  const files = fs.readdirSync(COUPLE_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`Found ${files.length} JPEG photos to convert`);

  let totalOriginal = 0;
  let totalWebp = 0;

  for (const file of files) {
    const inputPath = path.join(COUPLE_DIR, file);
    const outputName = file.replace('.jpg', '.webp');
    const outputPath = path.join(COUPLE_DIR, outputName);

    const stats = fs.statSync(inputPath);
    totalOriginal += stats.size;

    await sharp(inputPath)
      .webp({ quality: 82 })
      .toFile(outputPath);

    const webpStats = fs.statSync(outputPath);
    totalWebp += webpStats.size;

    const savings = ((1 - webpStats.size / stats.size) * 100).toFixed(1);
    console.log(`  ${file} → ${outputName}: ${(stats.size / 1024).toFixed(0)}KB → ${(webpStats.size / 1024).toFixed(0)}KB (${savings}% smaller)`);
  }

  console.log('');
  console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB → ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOriginal - totalWebp) / 1024).toFixed(0)} KB (${((1 - totalWebp / totalOriginal) * 100).toFixed(1)}%)`);
}

convertPhotos().catch(console.error);
