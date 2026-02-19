/**
 * Screenshot Capture Script
 * 
 * This script captures authenticated screenshots of the XDrive portal.
 * 
 * Usage:
 *   npx ts-node scripts/capture-screenshots.ts
 * 
 * Authentication:
 *   - The script will open a browser and pause at the login page
 *   - Manually enter credentials in the browser
 *   - Press Enter in the terminal to continue after login
 * 
 * Environment Variables Required:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 * 
 * Security:
 *   - NO credentials are hardcoded
 *   - Manual authentication required
 */

import { chromium, Browser, Page } from 'playwright';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

// Viewport configurations
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Pages to capture
const PAGES = [
  { path: '/login', name: 'login', requiresAuth: false },
  { path: '/dashboard', name: 'dashboard', requiresAuth: true },
  { path: '/loads', name: 'loads', requiresAuth: true },
  { path: '/directory', name: 'directory', requiresAuth: true },
];

/**
 * Wait for user input in terminal
 */
function waitForUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Capture screenshot for a specific page and viewport
 */
async function captureScreenshot(
  page: Page,
  pagePath: string,
  filename: string,
  viewport: { width: number; height: number }
): Promise<void> {
  console.log(`  → Navigating to ${pagePath}...`);
  await page.setViewportSize(viewport);
  
  try {
    await page.goto(`${BASE_URL}${pagePath}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for any animations or loading
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    console.log(`  ✓ Saved: ${filename}`);
  } catch (error) {
    console.error(`  ✗ Error capturing ${filename}:`, error);
    throw error;
  }
}

/**
 * Main screenshot capture function
 */
async function captureScreenshots() {
  console.log('🎬 XDrive Portal Screenshot Capture');
  console.log('====================================\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log(`✓ Created directory: ${SCREENSHOTS_DIR}\n`);
  }

  let browser: Browser | null = null;
  
  try {
    // Launch browser in headed mode for manual authentication
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: null,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();

    // Step 1: Navigate to login page for authentication
    console.log('\n📋 Step 1: Authentication');
    console.log('========================');
    console.log(`Navigating to ${BASE_URL}/login...`);
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n⚠️  MANUAL AUTHENTICATION REQUIRED');
    console.log('==================================');
    console.log('1. The browser window is now open');
    console.log('2. Enter your credentials in the login form');
    console.log('3. Complete the login process');
    console.log('4. Wait until you see the dashboard or are logged in');
    console.log('5. Then come back here and press Enter to continue\n');

    await waitForUserInput('Press Enter when you are logged in... ');

    // Step 2: Capture desktop screenshots
    console.log('\n📸 Step 2: Capturing Desktop Screenshots (1440x900)');
    console.log('===================================================');
    
    for (const pageInfo of PAGES) {
      console.log(`\n${pageInfo.name.toUpperCase()}:`);
      await captureScreenshot(
        page,
        pageInfo.path,
        `desktop-${pageInfo.name}.png`,
        DESKTOP_VIEWPORT
      );
    }

    // Step 3: Capture mobile screenshots
    console.log('\n📱 Step 3: Capturing Mobile Screenshots (390x844)');
    console.log('==================================================');
    
    for (const pageInfo of PAGES) {
      console.log(`\n${pageInfo.name.toUpperCase()}:`);
      await captureScreenshot(
        page,
        pageInfo.path,
        `mobile-${pageInfo.name}.png`,
        MOBILE_VIEWPORT
      );
    }

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Location: ${SCREENSHOTS_DIR}\n`);

    await context.close();
    
  } catch (error) {
    console.error('\n❌ Error during screenshot capture:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
if (require.main === module) {
  captureScreenshots()
    .then(() => {
      console.log('✅ Screenshot capture completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Screenshot capture failed:', error);
      process.exit(1);
    });
}

export { captureScreenshots };
