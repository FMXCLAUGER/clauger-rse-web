#!/usr/bin/env node

const { createWorker, createScheduler } = require('tesseract.js');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const IMAGES_DIR = path.join(__dirname, '../public/images/rapport');
const OUTPUT_DIR = path.join(__dirname, '../public/data/ocr');
const CONCURRENCY = Math.min(4, os.cpus().length);
const LANGUAGE = 'fra';

class OCRProcessor {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async initialize() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log('\n📄 Clauger RSE - OCR Text Extraction');
    console.log('=====================================\n');
  }

  async findImages() {
    const files = await fs.readdir(IMAGES_DIR);
    return files
      .filter(f => f.toLowerCase().match(/\.png$/))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });
  }

  async processImages() {
    const images = await this.findImages();

    if (images.length === 0) {
      console.error('❌ No PNG images found in', IMAGES_DIR);
      process.exit(1);
    }

    console.log(`📊 Found ${images.length} images`);
    console.log(`⚙️  Using ${CONCURRENCY} parallel workers`);
    console.log(`🇫🇷 Language: French (${LANGUAGE.toUpperCase()})\n`);

    const scheduler = createScheduler();

    try {
      console.log('🔧 Initializing Tesseract workers...');
      const workers = await Promise.all(
        Array.from({ length: CONCURRENCY }, async (_, i) => {
          const worker = await createWorker(LANGUAGE, 1, {
            cacheMethod: 'write',
            logger: m => {
              if (m.status === 'loading tesseract core') {
                console.log(`   Worker ${i + 1}: ${m.status}`);
              }
            }
          });
          scheduler.addWorker(worker);
          return worker;
        })
      );
      console.log('✓ Workers ready\n');

      console.log('🔍 Processing images...\n');

      let processed = 0;
      const jobs = images.map(async (filename, index) => {
        const imagePath = path.join(IMAGES_DIR, filename);
        const pageNumber = index + 1;

        try {
          const jobStart = Date.now();
          const { data } = await scheduler.addJob('recognize', imagePath);
          const jobTime = Date.now() - jobStart;

          const result = {
            id: pageNumber,
            pageNumber,
            filename,
            text: data.text.trim(),
            confidence: Math.round(data.confidence * 10) / 10,
            words: data.words.length,
            processingTime: jobTime
          };

          processed++;
          const progress = Math.round((processed / images.length) * 100);
          console.log(
            `✓ [${processed}/${images.length}] Page ${pageNumber.toString().padStart(2, '0')} - ${data.confidence.toFixed(1)}% confidence (${jobTime}ms) [${progress}%]`
          );

          return result;

        } catch (error) {
          processed++;
          console.error(`✗ [${processed}/${images.length}] Page ${pageNumber}: ${error.message}`);
          return {
            id: pageNumber,
            pageNumber,
            filename,
            error: error.message
          };
        }
      });

      this.results = await Promise.all(jobs);

      await this.saveResults();
      await this.printSummary();

    } finally {
      await scheduler.terminate();
    }
  }

  async saveResults() {
    const successful = this.results.filter(r => !r.error);

    const output = {
      metadata: {
        totalPages: this.results.length,
        successful: successful.length,
        failed: this.results.filter(r => r.error).length,
        language: LANGUAGE,
        avgConfidence: Math.round(
          (successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length) * 10
        ) / 10,
        processingTime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      pages: this.results.map(({ processingTime, ...rest }) => rest)
    };

    const outputPath = path.join(OUTPUT_DIR, 'pages.json');
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    const fullTextPath = path.join(OUTPUT_DIR, 'full-text.txt');
    const fullText = successful
      .map(r => `\n\n=== Page ${r.pageNumber} - ${r.filename} ===\n\n${r.text}`)
      .join('\n');
    await fs.writeFile(fullTextPath, fullText);

    console.log(`\n✓ Results saved to: ${OUTPUT_DIR}/`);
    console.log(`   - pages.json (structured data)`);
    console.log(`   - full-text.txt (combined text)`);
  }

  async printSummary() {
    const totalTime = Date.now() - this.startTime;
    const successful = this.results.filter(r => !r.error);
    const failed = this.results.filter(r => r.error);

    console.log('\n' + '='.repeat(60));
    console.log('✨ OCR EXTRACTION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total pages: ${this.results.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log(`   Avg confidence: ${(successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length).toFixed(1)}%`);
    console.log(`   Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`   Avg per page: ${Math.round(totalTime / this.results.length)}ms`);

    if (failed.length > 0) {
      console.log(`\n⚠️  Failed pages:`);
      failed.forEach(r => console.log(`   - Page ${r.pageNumber}: ${r.error}`));
    }

    console.log(`\n📁 Output: ${OUTPUT_DIR}/pages.json`);
  }
}

async function main() {
  const processor = new OCRProcessor();
  await processor.initialize();
  await processor.processImages();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
