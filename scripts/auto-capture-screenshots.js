#!/usr/bin/env node

/**
 * Automated Screenshot Capture Script
 * Captures screenshots of the XDrive portal pages
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  { name: 'login', path: '/login', requiresAuth: false },
  { name: 'dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'loads', path: '/loads', requiresAuth: true },
  { name: 'directory', path: '/directory', requiresAuth: true },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');
  
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    for (const viewport of viewports) {
      console.log(`\n📱 Capturing ${viewport.name} screenshots (${viewport.width}x${viewport.height})...\n`);
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      
      const page = await context.newPage();
      
      for (const pageConfig of pages) {
        const filename = `${viewport.name}-${pageConfig.name}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        try {
          console.log(`  📸 Capturing ${pageConfig.path}...`);
          
          await page.goto(`${BASE_URL}${pageConfig.path}`, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });
          
          // Wait a bit for any animations or dynamic content
          await page.waitForTimeout(2000);
          
          // Take full page screenshot
          await page.screenshot({
            path: filepath,
            fullPage: true,
          });
          
          console.log(`  ✅ Saved: ${filename}`);
          
        } catch (error) {
          console.log(`  ❌ Failed to capture ${pageConfig.path}: ${error.message}`);
        }
      }
      
      await context.close();
    }
    
    console.log('\n✅ Screenshot capture complete!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the capture
captureScreenshots().catch(console.error);
