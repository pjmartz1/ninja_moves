import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('Desktop landing page visual comparison', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Wait for all content to load including animations
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow animations to settle
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('desktop-landing-page.png', {
      fullPage: true,
      animations: 'disabled', // Disable animations for consistent screenshots
    });
  });

  test('Mobile landing page visual comparison', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('mobile-landing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Upload area states visual comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Normal state
    const uploadArea = page.locator('input[type="file"], [data-testid="upload-area"]').first();
    if (await uploadArea.isVisible()) {
      await expect(uploadArea).toHaveScreenshot('upload-area-normal.png');
      
      // Hover state
      await uploadArea.hover();
      await page.waitForTimeout(300);
      await expect(uploadArea).toHaveScreenshot('upload-area-hover.png');
    }
  });

  test('Button states visual comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      // Normal state
      await expect(buttons).toHaveScreenshot('button-normal.png');
      
      // Hover state
      await buttons.hover();
      await page.waitForTimeout(300);
      await expect(buttons).toHaveScreenshot('button-hover.png');
      
      // Focus state
      await buttons.focus();
      await page.waitForTimeout(300);
      await expect(buttons).toHaveScreenshot('button-focus.png');
    }
  });

  test('Color scheme and gradient verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Capture specific elements with orange/amber gradients
    const gradientElements = page.locator('[class*="bg-gradient"], [class*="gradient"]');
    
    for (let i = 0; i < Math.min(await gradientElements.count(), 3); i++) {
      const element = gradientElements.nth(i);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`gradient-element-${i}.png`);
      }
    }
  });
});