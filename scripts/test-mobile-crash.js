import { chromium } from 'playwright';

async function testMobileCrash() {
  console.log('🔍 Testing mobile viewport crash...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page error:', error.message);
    console.log('Stack:', error.stack);
  });
  
  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('✅ Login page loaded\n');
    
    // Try to navigate to dashboard (should redirect to login if not authenticated)
    console.log('Testing /dashboard route...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Dashboard page processed\n');
    
    // Wait a bit to see if any errors occur
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Total errors found:', errors.length);
      console.log('Errors:', JSON.stringify(errors, null, 2));
    } else {
      console.log('✅ No errors detected on mobile viewport!');
    }
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'docs/screenshots/test-mobile-dashboard.png', fullPage: true });
    console.log('📸 Screenshot saved to docs/screenshots/test-mobile-dashboard.png');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await browser.close();
  }
}

testMobileCrash();
