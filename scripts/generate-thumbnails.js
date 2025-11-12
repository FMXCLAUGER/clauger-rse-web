#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images/rapport');
const THUMBNAILS_DIR = path.join(__dirname, '../public/images/thumbnails');
const INDEX_FILE = path.join(THUMBNAILS_DIR, 'index.json');

const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 150;
const QUALITY = 80;

class ThumbnailGenerator {
  constructor() {
    this.startTime = Date.now();
    this.thumbnails = [];
  }

  async initialize() {
    console.log('\n📸 Clauger RSE - Thumbnail Generation');
    console.log('=====================================\n');

    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
    console.log('✓ Thumbnails directory ready\n');
    console.log(`⚙️  Configuration:`);
    console.log(`   - Size: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}px`);
    console.log(`   - Quality: ${QUALITY}%`);
    console.log(`   - Format: WebP (optimized)\n`);
  }

  async findImages() {
    console.log('📂 Scanning images directory...');
    const files = await fs.readdir(IMAGES_DIR);

    const imageFiles = files
      .filter(f => f.toLowerCase().match(/\.(png|jpe?g|webp)$/))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });

    console.log(`✓ Found ${imageFiles.length} images\n`);
    return imageFiles;
  }

  async generateThumbnail(filename, index) {
    const inputPath = path.join(IMAGES_DIR, filename);
    const pageNumber = parseInt(filename.match(/\d+/)?.[0] || '0');

    const outputFilename = `page-${pageNumber}.webp`;
    const outputPath = path.join(THUMBNAILS_DIR, outputFilename);

    try {
      const startTime = Date.now();

      const metadata = await sharp(inputPath).metadata();

      await sharp(inputPath)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'cover',
          position: 'top'
        })
        .webp({
          quality: QUALITY,
          effort: 6
        })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const processTime = Date.now() - startTime;

      const thumbnailInfo = {
        pageNumber,
        filename: outputFilename,
        originalImage: filename,
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        size: stats.size,
        originalSize: {
          width: metadata.width,
          height: metadata.height
        }
      };

      this.thumbnails.push(thumbnailInfo);

      console.log(
        `✓ [${index + 1}] Page ${pageNumber.toString().padStart(2, '0')} - ` +
        `${(stats.size / 1024).toFixed(1)} KB (${processTime}ms)`
      );

      return thumbnailInfo;

    } catch (error) {
      console.error(`✗ [${index + 1}] Page ${pageNumber}: ${error.message}`);
      return null;
    }
  }

  async generateAll(imageFiles) {
    console.log('🔍 Generating thumbnails...\n');

    const results = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const result = await this.generateThumbnail(imageFiles[i], i);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async saveIndex() {
    const index = {
      metadata: {
        totalThumbnails: this.thumbnails.length,
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        format: 'webp',
        quality: QUALITY,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - this.startTime
      },
      thumbnails: this.thumbnails.sort((a, b) => a.pageNumber - b.pageNumber)
    };

    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));

    const totalSize = this.thumbnails.reduce((sum, t) => sum + t.size, 0);

    console.log('\n' + '='.repeat(60));
    console.log('✨ THUMBNAIL GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total thumbnails: ${this.thumbnails.length}`);
    console.log(`   Total size: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log(`   Average size: ${(totalSize / this.thumbnails.length / 1024).toFixed(1)} KB`);
    console.log(`   Total time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
    console.log(`   Avg per thumbnail: ${Math.round((Date.now() - this.startTime) / this.thumbnails.length)}ms`);

    console.log(`\n📁 Output:`);
    console.log(`   - Thumbnails: ${THUMBNAILS_DIR}/`);
    console.log(`   - Index: ${INDEX_FILE}`);

    console.log(`\n💡 Usage in components:`);
    console.log(`   <Image src="/images/thumbnails/page-1.webp" width={100} height={150} />`);
    console.log();
  }
}

async function main() {
  const generator = new ThumbnailGenerator();

  try {
    await generator.initialize();

    const imageFiles = await generator.findImages();

    if (imageFiles.length === 0) {
      console.error('❌ No images found in', IMAGES_DIR);
      process.exit(1);
    }

    await generator.generateAll(imageFiles);

    await generator.saveIndex();

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
