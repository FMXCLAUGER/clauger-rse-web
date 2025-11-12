#!/usr/bin/env node

const { createWorker } = require('tesseract.js');
const fs = require('fs/promises');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images/rapport');
const OCR_FILE = path.join(__dirname, '../public/data/ocr/pages.json');
const CONFIDENCE_THRESHOLD = 70;
const LANGUAGE = 'fra';

const FRENCH_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'pour', 'dans',
  'sur', 'avec', 'sans', 'sous', 'vers', 'par', 'entre', 'chez',
  'à', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
  'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs',
  'qui', 'que', 'quoi', 'dont', 'où'
]);

class OCRReprocessor {
  constructor() {
    this.startTime = Date.now();
    this.worker = null;
  }

  async initialize() {
    console.log('\n🔄 Clauger RSE - OCR Reprocessing');
    console.log('===================================\n');

    console.log('🔧 Initializing optimized Tesseract worker...');
    this.worker = await createWorker(LANGUAGE, 1, {
      cacheMethod: 'write'
    });

    await this.worker.setParameters({
      tessedit_pageseg_mode: '3',
      tessedit_ocr_engine_mode: '1',
      tessedit_char_blacklist: '|~`^°¤§±·×÷¬¦¨´¸¿',
      preserve_interword_spaces: '1'
    });

    console.log('✓ Worker ready with optimized parameters\n');
    console.log('⚙️  Configuration:');
    console.log(`   - PSM: 3 (Auto page segmentation)`);
    console.log(`   - OEM: 1 (LSTM Neural Net)`);
    console.log(`   - Confidence threshold: ${CONFIDENCE_THRESHOLD}%`);
    console.log(`   - Post-processing: Enabled\n`);
  }

  async loadCurrentData() {
    console.log('📂 Loading current OCR data...');
    const data = JSON.parse(await fs.readFile(OCR_FILE, 'utf8'));
    console.log(`✓ Loaded ${data.pages.length} pages\n`);
    return data;
  }

  identifyLowConfidencePages(data) {
    const lowConfPages = data.pages.filter(p =>
      p.confidence < CONFIDENCE_THRESHOLD && !p.error
    );

    console.log(`📊 Analysis:`);
    console.log(`   Total pages: ${data.pages.length}`);
    console.log(`   Pages < ${CONFIDENCE_THRESHOLD}%: ${lowConfPages.length}`);

    if (lowConfPages.length > 0) {
      console.log('\n🎯 Pages to reprocess:');
      lowConfPages.forEach(p => {
        console.log(`   - Page ${p.pageNumber}: ${p.confidence}% confidence`);
      });
    }

    console.log();
    return lowConfPages;
  }

  cleanText(text) {
    let cleaned = text;

    cleaned = cleaned.replace(/[|~`^°¤§±·×÷¬¦¨´¸]/g, '');

    cleaned = cleaned.replace(/([A-Z])\1{4,}/g, match => match.slice(0, 3));

    cleaned = cleaned.replace(/\s+/g, ' ');

    cleaned = cleaned.replace(/(\r?\n){3,}/g, '\n\n');

    cleaned = cleaned.split(/\s+/)
      .filter(word => {
        if (word.length <= 2) {
          return !FRENCH_STOPWORDS.has(word.toLowerCase());
        }
        return true;
      })
      .join(' ');

    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');

    cleaned = cleaned.replace(/\s([.,;:!?])/g, '$1');

    cleaned = cleaned.trim();

    return cleaned;
  }

  async reprocessPage(page) {
    const imagePath = path.join(IMAGES_DIR, page.filename);

    try {
      const jobStart = Date.now();
      const { data } = await this.worker.recognize(imagePath);
      const jobTime = Date.now() - jobStart;

      const cleanedText = this.cleanText(data.text);

      const oldConfidence = page.confidence;
      const newConfidence = Math.round(data.confidence * 10) / 10;
      const improvement = newConfidence - oldConfidence;

      console.log(
        `✓ Page ${page.pageNumber.toString().padStart(2, '0')} - ` +
        `${oldConfidence}% → ${newConfidence}% ` +
        `(${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%) ` +
        `[${jobTime}ms]`
      );

      return {
        ...page,
        text: cleanedText,
        confidence: newConfidence,
        words: data.words.length,
        reprocessed: true,
        reprocessedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`✗ Page ${page.pageNumber}: ${error.message}`);
      return page;
    }
  }

  async reprocessPages(data, lowConfPages) {
    if (lowConfPages.length === 0) {
      console.log('✨ No pages need reprocessing!\n');
      return data;
    }

    console.log('🔍 Reprocessing pages...\n');

    const reprocessedPages = [];
    for (const page of lowConfPages) {
      const result = await this.reprocessPage(page);
      reprocessedPages.push(result);
    }

    const updatedPages = data.pages.map(p => {
      const reprocessed = reprocessedPages.find(rp => rp.id === p.id);
      return reprocessed || p;
    });

    const successful = updatedPages.filter(p => !p.error);
    const newAvgConfidence = Math.round(
      (successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length) * 10
    ) / 10;

    return {
      metadata: {
        ...data.metadata,
        avgConfidence: newAvgConfidence,
        lastReprocessed: new Date().toISOString(),
        reprocessedPages: reprocessedPages.length
      },
      pages: updatedPages
    };
  }

  async saveResults(data, originalData) {
    await fs.writeFile(OCR_FILE, JSON.stringify(data, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✨ REPROCESSING COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Results:`);
    console.log(`   Pages reprocessed: ${data.metadata.reprocessedPages || 0}`);
    console.log(`   Old avg confidence: ${originalData.metadata.avgConfidence}%`);
    console.log(`   New avg confidence: ${data.metadata.avgConfidence}%`);
    console.log(`   Improvement: +${(data.metadata.avgConfidence - originalData.metadata.avgConfidence).toFixed(1)}%`);

    const totalTime = Date.now() - this.startTime;
    console.log(`   Total time: ${(totalTime / 1000).toFixed(1)}s`);

    console.log(`\n📁 Updated: ${OCR_FILE}`);
    console.log('\n💡 Tip: Run "npm run build" to apply changes to the app\n');
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}

async function main() {
  const reprocessor = new OCRReprocessor();

  try {
    await reprocessor.initialize();

    const originalData = await reprocessor.loadCurrentData();

    const lowConfPages = reprocessor.identifyLowConfidencePages(originalData);

    const updatedData = await reprocessor.reprocessPages(originalData, lowConfPages);

    await reprocessor.saveResults(updatedData, originalData);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await reprocessor.terminate();
  }
}

main();
