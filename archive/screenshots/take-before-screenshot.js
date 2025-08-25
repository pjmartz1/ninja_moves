// Take before screenshot of file requirements section
const { chromium } = require('playwright');

async function takeBeforeScreenshot() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('📸 Taking BEFORE screenshot of file requirements...');
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Wait for the file requirements section to load
    await page.waitForSelector('.space-y-4', { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'file-requirements-BEFORE.png',
      fullPage: true 
    });
    
    // Take focused screenshot of just the requirements section
    const requirementsSection = page.locator('.space-y-4').first();
    await requirementsSection.screenshot({
      path: 'file-requirements-section-BEFORE.png'
    });
    
    console.log('✅ BEFORE screenshots saved:');
    console.log('  - file-requirements-BEFORE.png (full page)');
    console.log('  - file-requirements-section-BEFORE.png (focused section)');
    
  } catch (error) {
    console.log('❌ Screenshot failed:', error.message);
  }
  
  await browser.close();
}

takeBeforeScreenshot().catch(console.error);