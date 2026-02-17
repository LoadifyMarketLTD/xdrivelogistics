import { chromium } from 'playwright';

async function captureMobileScreenshots() {
  console.log('📸 Capturing mobile screenshots...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile viewport
  });
  
  const page = await context.newPage();
  
  const pages = [
    { name: 'login', url: '/login' },
    { name: 'dashboard', url: '/dashboard' },
    { name: 'loads', url: '/loads' },
    { name: 'directory', url: '/directory' },
  ];
  
  for (const pageInfo of pages) {
    try {
      console.log(`Capturing ${pageInfo.name}...`);
      await page.goto(`http://localhost:3000${pageInfo.url}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Wait a bit for any animations
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `docs/screenshots/mobile-${pageInfo.name}.png`, 
        fullPage: true 
      });
      
      console.log(`✅ Saved mobile-${pageInfo.name}.png`);
    } catch (error) {
      console.error(`❌ Error capturing ${pageInfo.name}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('\n✅ All mobile screenshots captured!');
}

captureMobileScreenshots();
