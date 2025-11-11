#!/usr/bin/env node

import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  inputDir: path.join(__dirname, '../public/images/rapport'),
  outputDir: path.join(__dirname, '../public/images/rapport-optimized'),
  metadataFile: path.join(__dirname, '../public/images-metadata.json'),
  formats: ['webp', 'avif'],
  quality: {
    webp: 85,
    avif: 75,
  },
  effort: {
    webp: 6,
    avif: 6,
  },
  blurSize: 10,
};

const formatOptions = {
  webp: {
    quality: CONFIG.quality.webp,
    effort: CONFIG.effort.webp,
    lossless: false,
    smartSubsample: true,
  },
  avif: {
    quality: CONFIG.quality.avif,
    effort: CONFIG.effort.avif,
    chromaSubsampling: '4:2:0',
  },
};

async function generateBlurPlaceholder(inputPath) {
  try {
    const buffer = await sharp(inputPath)
      .resize(CONFIG.blurSize)
      .blur(0.5)
      .jpeg({ quality: 30 })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error generating blur for ${inputPath}:`, error.message);
    return null;
  }
}

async function getImageMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  } catch (error) {
    console.error(`Error getting metadata for ${inputPath}:`, error.message);
    return null;
  }
}

async function convertImage(inputPath, baseName) {
  const results = {};

  for (const format of CONFIG.formats) {
    const outputPath = path.join(CONFIG.outputDir, `${baseName}.${format}`);

    try {
      const startTime = Date.now();

      await sharp(inputPath)
        .toFormat(format, formatOptions[format])
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const elapsed = Date.now() - startTime;

      results[format] = {
        path: outputPath,
        size: stats.size,
        sizeMB: (stats.size / 1024 / 1024).toFixed(2),
        time: `${elapsed}ms`,
      };

      console.log(`  ✓ ${format.toUpperCase()}: ${results[format].sizeMB}MB (${elapsed}ms)`);
    } catch (error) {
      console.error(`  ✗ ${format.toUpperCase()} error:`, error.message);
      results[format] = { error: error.message };
    }
  }

  return results;
}

async function processImage(inputPath) {
  const fileName = path.basename(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const normalizedName = baseName.replace(/\s+/g, '-').toLowerCase();

  console.log(`\nProcessing: ${fileName}`);

  const [metadata, blurDataURL, conversionResults] = await Promise.all([
    getImageMetadata(inputPath),
    generateBlurPlaceholder(inputPath),
    convertImage(inputPath, normalizedName),
  ]);

  if (blurDataURL) {
    console.log(`  ✓ Blur placeholder generated`);
  }

  const originalStats = await fs.stat(inputPath);
  const webpSize = conversionResults.webp?.size || 0;
  const avifSize = conversionResults.avif?.size || 0;

  const savings = {
    webp: webpSize ? ((1 - webpSize / originalStats.size) * 100).toFixed(1) : 0,
    avif: avifSize ? ((1 - avifSize / originalStats.size) * 100).toFixed(1) : 0,
  };

  console.log(`  💾 Savings: WebP ${savings.webp}%, AVIF ${savings.avif}%`);

  return {
    originalName: fileName,
    normalizedName,
    metadata,
    blurDataURL,
    originalSize: originalStats.size,
    originalSizeMB: (originalStats.size / 1024 / 1024).toFixed(2),
    conversions: conversionResults,
    savings,
  };
}

async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('================================\n');
  console.log('Configuration:');
  console.log(`  Input:  ${CONFIG.inputDir}`);
  console.log(`  Output: ${CONFIG.outputDir}`);
  console.log(`  Formats: ${CONFIG.formats.join(', ')}`);
  console.log(`  Quality: WebP ${CONFIG.quality.webp}, AVIF ${CONFIG.quality.avif}`);
  console.log('');

  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  const imagePattern = path.join(CONFIG.inputDir, '*.{jpg,jpeg,png,PNG,JPG,JPEG}');
  const images = await glob(imagePattern);

  if (images.length === 0) {
    console.log('❌ No images found!');
    process.exit(1);
  }

  console.log(`Found ${images.length} images to process\n`);

  const allResults = {};
  const stats = {
    total: images.length,
    successful: 0,
    failed: 0,
    totalOriginalSize: 0,
    totalWebPSize: 0,
    totalAVIFSize: 0,
  };

  for (const imagePath of images) {
    try {
      const result = await processImage(imagePath);

      const baseName = result.normalizedName;
      allResults[baseName] = {
        width: result.metadata?.width,
        height: result.metadata?.height,
        blurDataURL: result.blurDataURL,
        webp: `/images/rapport-optimized/${baseName}.webp`,
        avif: `/images/rapport-optimized/${baseName}.avif`,
        originalSize: result.originalSizeMB,
      };

      stats.successful++;
      stats.totalOriginalSize += result.originalSize;
      stats.totalWebPSize += result.conversions.webp?.size || 0;
      stats.totalAVIFSize += result.conversions.avif?.size || 0;
    } catch (error) {
      console.error(`\n✗ Failed to process ${imagePath}:`, error.message);
      stats.failed++;
    }
  }

  await fs.writeFile(
    CONFIG.metadataFile,
    JSON.stringify(allResults, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log('📊 Optimization Summary');
  console.log('='.repeat(60));
  console.log(`Total images processed: ${stats.total}`);
  console.log(`✓ Successful: ${stats.successful}`);
  console.log(`✗ Failed: ${stats.failed}`);
  console.log('');
  console.log('File Sizes:');
  console.log(`  Original: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  WebP:     ${(stats.totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  AVIF:     ${(stats.totalAVIFSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('');

  const webpSavings = ((1 - stats.totalWebPSize / stats.totalOriginalSize) * 100).toFixed(1);
  const avifSavings = ((1 - stats.totalAVIFSize / stats.totalOriginalSize) * 100).toFixed(1);

  console.log('Savings:');
  console.log(`  WebP: ${webpSavings}% reduction`);
  console.log(`  AVIF: ${avifSavings}% reduction`);
  console.log('');
  console.log(`Metadata saved to: ${CONFIG.metadataFile}`);
  console.log('\n✨ Optimization complete!\n');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
