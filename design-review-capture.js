const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  try {
    const page = await context.newPage();
    
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for components to load
    await page.waitForTimeout(2000);
    
    // Take desktop screenshots
    console.log('Taking desktop full page screenshot...');
    await page.screenshot({ 
      path: 'design-review-desktop-full.png', 
      fullPage: true 
    });
    
    console.log('Taking desktop viewport screenshot...');
    await page.screenshot({ 
      path: 'design-review-desktop-viewport.png', 
      fullPage: false 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ 
      path: 'design-review-mobile-full.png', 
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    console.log('Taking tablet screenshot...');
    await page.screenshot({ 
      path: 'design-review-tablet-full.png', 
      fullPage: true 
    });
    
    console.log('Screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
})();