import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureScreenshots() {
  console.log('📸 Capturing portal screenshots...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  // Desktop screenshots
  console.log('Desktop screenshots (1440px)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  
  const desktopPage = await desktopContext.newPage();
  
  const desktopPages = [
    { name: 'login', url: '/login' },
    { name: 'dashboard', url: '/dashboard' },
    { name: 'loads', url: '/loads' },
    { name: 'directory', url: '/directory' },
    { name: 'quotes', url: '/quotes' },
    { name: 'drivers-vehicles', url: '/drivers-vehicles' },
    { name: 'live-availability', url: '/live-availability' },
    { name: 'return-journeys', url: '/return-journeys' },
  ];
  
  for (const page of desktopPages) {
    try {
      console.log(`  Capturing desktop-${page.name}.png...`);
      await desktopPage.goto(`http://localhost:3000${page.url}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await desktopPage.waitForTimeout(2000);
      await desktopPage.screenshot({ 
        path: `docs/screenshots/desktop-${page.name}.png`,
        fullPage: true 
      });
      console.log(`  ✅ desktop-${page.name}.png`);
    } catch (error) {
      console.log(`  ❌ Error capturing desktop-${page.name}: ${error.message}`);
    }
  }
  
  await desktopContext.close();
  
  // Mobile screenshots
  console.log('\nMobile screenshots (375px)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  
  const mobilePage = await mobileContext.newPage();
  
  const mobilePages = [
    { name: 'login', url: '/login' },
    { name: 'dashboard', url: '/dashboard' },
    { name: 'loads', url: '/loads' },
    { name: 'directory', url: '/directory' },
  ];
  
  for (const page of mobilePages) {
    try {
      console.log(`  Capturing mobile-${page.name}.png...`);
      await mobilePage.goto(`http://localhost:3000${page.url}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await mobilePage.waitForTimeout(2000);
      await mobilePage.screenshot({ 
        path: `docs/screenshots/mobile-${page.name}.png`,
        fullPage: true 
      });
      console.log(`  ✅ mobile-${page.name}.png`);
    } catch (error) {
      console.log(`  ❌ Error capturing mobile-${page.name}: ${error.message}`);
    }
  }
  
  await mobileContext.close();
  await browser.close();
  
  console.log('\n✅ All screenshots captured successfully!');
  console.log('📁 Saved to docs/screenshots/');
}

captureScreenshots().catch(console.error);
