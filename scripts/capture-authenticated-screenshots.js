import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshots() {
  console.log('🚀 Starting authenticated screenshot capture...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take login screenshot before attempting auth
    const loginPath = path.join(__dirname, '../docs/screenshots/desktop-login.png');
    await page.screenshot({ path: loginPath, fullPage: true });
    console.log('✅ Captured: desktop-login.png');
    
    // Check if we need to authenticate
    // Try to use test credentials if they're available in environment
    const testEmail = process.env.TEST_USER_EMAIL || 'test@xdrivelogistics.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
    
    console.log('🔐 Attempting authentication...');
    
    // Fill in email
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail);
      
      // Fill in password
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      await passwordInput.fill(testPassword);
      
      // Click login button
      const loginButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
      await loginButton.click();
      
      // Wait for navigation
      await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {
        console.log('⚠️  Did not redirect to dashboard - may need manual authentication');
      });
      
      // Wait a bit for any loading states
      await page.waitForTimeout(2000);
    }
    
    // Check if we're authenticated by checking current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('⚠️  Still on login page - authentication may have failed');
      console.log('   This may be due to invalid test credentials.');
      console.log('   Screenshots will show unauthenticated views (redirects to login).');
    } else {
      console.log('✅ Authentication successful!');
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
        await page.waitForTimeout(2000);
        
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
