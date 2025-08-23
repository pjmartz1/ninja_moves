import { test, expect } from '@playwright/test';

test.describe('PDFTablePro - Basic UI Testing', () => {
  test('Desktop basic functionality', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check page loads and has correct title
    await expect(page).toHaveTitle(/Next.js/); // Using default Next.js title for now
    
    // Check main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check heading is present
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('PDFTablePro');
    
    // Check button is present and clickable
    const button = page.locator('button');
    await expect(button).toBeVisible();
    await expect(button).toContainText('Test Button');
    
    // Test button functionality
    const status = page.locator('p:has-text("Status:")');
    await expect(status).toContainText('Inactive');
    
    await button.click();
    await expect(status).toContainText('Active');
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/desktop-basic.png', fullPage: true });
  });

  test('Mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile adaptation
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check content is still accessible on mobile
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    const button = page.locator('button');
    await expect(button).toBeVisible();
    
    // Check button is touch-friendly (minimum size)
    const buttonBox = await button.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThan(40);
      expect(buttonBox.width).toBeGreaterThan(60);
    }
    
    // Test interaction on mobile
    await button.click();
    const status = page.locator('p:has-text("Status:")');
    await expect(status).toContainText('Active');
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-basic.png', fullPage: true });
  });

  test('Basic performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load quickly
    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);
    
    // Check for basic performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstByte: navigation.responseStart - navigation.requestStart
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Assert reasonable performance
    expect(performanceMetrics.firstByte).toBeLessThan(1000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
  });

  test('CSS and styling verification', async ({ page }) => {
    await page.goto('/');
    
    // Check Tailwind CSS is working
    const mainElement = page.locator('main');
    const mainClass = await mainElement.getAttribute('class');
    expect(mainClass).toContain('min-h-screen');
    
    // Check button styling
    const button = page.locator('button');
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toContain('bg-blue-500');
    expect(buttonClass).toContain('text-white');
    
    // Verify computed styles
    const buttonComputedStyle = await button.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        padding: style.padding
      };
    });
    
    // Should have proper styling applied
    expect(buttonComputedStyle.backgroundColor).toContain('rgb');
    expect(buttonComputedStyle.color).toContain('rgb');
  });

  test('Cross-browser compatibility basics', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Basic functionality should work across browsers
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    const button = page.locator('button');
    await button.click();
    
    const status = page.locator('p:has-text("Status:")');
    await expect(status).toContainText('Active');
    
    console.log(`✓ Basic functionality verified in ${browserName}`);
  });

  test('Accessibility basics', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test if button is keyboard accessible
    const button = page.locator('button');
    await button.focus();
    await page.keyboard.press('Enter');
    
    const status = page.locator('p:has-text("Status:")');
    await expect(status).toContainText('Active');
    
    console.log('✓ Basic keyboard accessibility verified');
  });
});