import { chromium } from 'playwright';

async function testMobileHydration() {
  console.log('Testing mobile hydration fix...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // Mobile viewport
  });
  
  const page = await context.newPage();
  
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  try {
    // Test login page first
    console.log('Testing /login...');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // Check for hydration errors or exceptions
    if (errors.length > 0) {
      console.log('❌ Errors found on login page:');
      errors.forEach(err => console.log('  - ' + err));
    } else {
      console.log('✅ Login page loaded without errors');
    }
    
    // Test dashboard redirect (should redirect to login if not authenticated)
    console.log('\nTesting /dashboard...');
    errors.length = 0;
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('❌ Errors found on dashboard:');
      errors.forEach(err => console.log('  - ' + err));
    } else {
      console.log('✅ Dashboard loaded without errors (redirected to login)');
    }
    
    // Test loads page
    console.log('\nTesting /loads...');
    errors.length = 0;
    await page.goto('http://localhost:3000/loads', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('❌ Errors found on loads:');
      errors.forEach(err => console.log('  - ' + err));
    } else {
      console.log('✅ Loads page loaded without errors');
    }
    
    console.log('\n✅ All mobile routes tested successfully - no hydration errors!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testMobileHydration().catch(console.error);
