// Take after screenshot of file requirements section
const { chromium } = require('playwright');

async function takeAfterScreenshot() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('📸 Taking AFTER screenshot of file requirements...');
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Wait for the file requirements section to load
    await page.waitForSelector('.space-y-4', { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'file-requirements-AFTER.png',
      fullPage: true 
    });
    
    // Take focused screenshot of just the requirements section
    const requirementsSection = page.locator('.space-y-4').first();
    await requirementsSection.screenshot({
      path: 'file-requirements-section-AFTER.png'
    });
    
    console.log('✅ AFTER screenshots saved:');
    console.log('  - file-requirements-AFTER.png (full page)');
    console.log('  - file-requirements-section-AFTER.png (focused section)');
    
  } catch (error) {
    console.log('❌ Screenshot failed:', error.message);
  }
  
  await browser.close();
}

takeAfterScreenshot().catch(console.error);