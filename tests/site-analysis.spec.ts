import { test, expect } from '@playwright/test';

test.describe('Site Analysis for AI Agents', () => {
  test('capture complete site state and functionality', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    
    // Take homepage screenshot
    await page.screenshot({ path: 'homepage-full.png', fullPage: true });
    
    // Test header navigation
    const headerLinks = await page.locator('header a').all();
    console.log('Header links found:', headerLinks.length);
    
    // Test logo clickability
    const logo = page.locator('header').getByText('PDFTablePro').first();
    await logo.screenshot({ path: 'logo-element.png' });
    
    // Test pricing page navigation
    await page.click('a[href="/pricing"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'pricing-page-full.png', fullPage: true });
    
    // Test pricing buttons
    const pricingButtons = await page.locator('text="Choose Plan"').all();
    console.log('Pricing buttons found:', pricingButtons.length);
    
    // Test features page
    await page.click('a[href="/features"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'features-page-full.png', fullPage: true });
    
    // Test help center
    await page.click('a[href="/help"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'help-page-full.png', fullPage: true });
    
    // Go back to homepage and test file upload
    await page.goto('http://localhost:3000');
    
    // Test file upload area
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-zone, .dropzone').first();
    if (await uploadArea.isVisible()) {
      await uploadArea.screenshot({ path: 'upload-area.png' });
    }
    
    // Test authentication modal trigger
    const authButton = page.locator('text="Sign In", text="Login", text="Get Started"').first();
    if (await authButton.isVisible()) {
      await authButton.click();
      await page.screenshot({ path: 'auth-modal.png' });
    }
    
    // Test footer elements
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await footer.screenshot({ path: 'footer-section.png' });
    }
    
    // Check for social media icons
    const socialIcons = await page.locator('footer [href*="twitter"], footer [href*="facebook"], footer [href*="linkedin"], footer [href*="instagram"]').all();
    console.log('Social media icons found:', socialIcons.length);
    
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'mobile-homepage.png', fullPage: true });
    
    // Test hamburger menu if exists
    const hamburger = page.locator('button[aria-label="Menu"], .hamburger, [data-testid="mobile-menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.screenshot({ path: 'mobile-menu.png' });
    }
  });
});