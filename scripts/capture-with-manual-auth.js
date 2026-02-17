import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshots() {
  console.log('🚀 Starting authenticated screenshot capture (HEADFUL mode)...');
  console.log('👉 A browser window will open. Please log in manually when prompted.');
  console.log('   After logging in, press ENTER in this terminal to continue.\n');
  
  const browser = await chromium.launch({
    headless: false,  // Show browser for manual login
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('📍 Opening login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take login screenshot
    const loginPath = path.join(__dirname, '../docs/screenshots/desktop-login.png');
    await page.screenshot({ path: loginPath, fullPage: true });
    console.log('✅ Captured: desktop-login.png');
    
    console.log('\n🔐 Please log in manually in the browser window...');
    console.log('   After successful login, press ENTER in this terminal to continue.\n');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
    console.log('\n📸 Continuing with screenshot capture...\n');
    
    // Wait a moment for any post-login redirects
    await page.waitForTimeout(2000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('⚠️  Still on login page. Continuing anyway...');
    } else {
      console.log('✅ Authenticated successfully!');
    }
    
    // Capture all required pages
    const pages = [
      { path: '/dashboard', filename: 'desktop-dashboard.png' },
      { path: '/loads', filename: 'desktop-loads.png' },
      { path: '/directory', filename: 'desktop-directory.png' },
      { path: '/quotes', filename: 'desktop-quotes.png' },
      { path: '/drivers-vehicles', filename: 'desktop-drivers-vehicles.png' },
      { path: '/live-availability', filename: 'desktop-live-availability.png' },
      { path: '/return-journeys', filename: 'desktop-return-journeys.png' },
    ];
    
    for (const pageInfo of pages) {
      try {
        console.log(`📍 Navigating to ${pageInfo.path}...`);
        await page.goto(`http://localhost:3000${pageInfo.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Capture screenshot
        const screenshotPath = path.join(__dirname, '../docs/screenshots', pageInfo.filename);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Captured: ${pageInfo.filename}`);
      } catch (error) {
        console.error(`❌ Error capturing ${pageInfo.filename}:`, error.message);
        // Continue with other screenshots
      }
    }
    
    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: docs/screenshots/`);
    console.log('\nPress ENTER to close browser and exit...');
    
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
