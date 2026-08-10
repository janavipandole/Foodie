/**
 * Automated Image Optimization Pipeline using Sharp
 * Converts images in imgs/ directory to WebP & AVIF formats with responsive breakpoints.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMGS_DIR = path.join(__dirname, '../imgs');
const OUTPUT_DIR = path.join(__dirname, '../imgs/optimized');

const BREAKPOINTS = [
  { suffix: '-sm', width: 320 },
  { suffix: '-md', width: 640 },
  { suffix: '-lg', width: 1024 }
];

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const inputPath = path.join(IMGS_DIR, file);
  const fileNameWithoutExt = path.parse(file).name;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Processing image: ${file}...`);

  for (const bp of BREAKPOINTS) {
    // Generate WebP
    const webpPath = path.join(OUTPUT_DIR, `${fileNameWithoutExt}${bp.suffix}.webp`);
    await sharp(inputPath)
      .resize(bp.width)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Generate AVIF
    const avifPath = path.join(OUTPUT_DIR, `${fileNameWithoutExt}${bp.suffix}.avif`);
    await sharp(inputPath)
      .resize(bp.width)
      .avif({ quality: 75 })
      .toFile(avifPath);
  }
}

async function runPipeline() {
  try {
    if (!fs.existsSync(IMGS_DIR)) {
      console.error('Images directory not found:', IMGS_DIR);
      return;
    }

    const files = fs.readdirSync(IMGS_DIR);
    console.log(`Found ${files.length} items in imgs directory.`);

    for (const file of files) {
      await processImage(file);
    }

    console.log('Image optimization pipeline finished successfully!');
  } catch (err) {
    console.error('Image optimization failed:', err);
  }
}

if (require.main === module) {
  runPipeline();
}

module.exports = { runPipeline, processImage };
