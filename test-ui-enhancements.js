const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('📸 Taking screenshots of UI enhancements...');
    
    // Navigate to the application
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load completely
    await page.waitForTimeout(2000);
    
    // Take full page screenshot
    console.log('Taking full page screenshot...');
    await page.screenshot({ 
      path: 'ui-enhancements-full-page.png', 
      fullPage: true 
    });
    
    // Take hero section screenshot
    console.log('Taking hero section screenshot...');
    const heroSection = page.locator('div.relative.h-\\[28rem\\]').first();
    await heroSection.screenshot({ 
      path: 'ui-enhancements-hero-section.png' 
    });
    
    // Take upload section screenshot
    console.log('Taking upload section screenshot...');
    const uploadSection = page.locator('section.container').first();
    await uploadSection.screenshot({ 
      path: 'ui-enhancements-upload-section.png' 
    });
    
    // Take footer screenshot
    console.log('Taking footer screenshot...');
    const footer = page.locator('footer');
    await footer.screenshot({ 
      path: 'ui-enhancements-footer.png' 
    });
    
    console.log('✅ Screenshots captured successfully!');
    console.log('Files saved:');
    console.log('- ui-enhancements-full-page.png');
    console.log('- ui-enhancements-hero-section.png');
    console.log('- ui-enhancements-upload-section.png');
    console.log('- ui-enhancements-footer.png');
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  }

  await browser.close();
})();