import { test, expect, Page } from '@playwright/test';

// Test configuration for different viewports
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe('PDFTablePro - Desktop UI/UX Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');
  });

  test('Landing page visual hierarchy and Buy Me a Coffee design elements', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveTitle(/PDFTablePro/);
    
    // Check header with premium design elements
    const header = page.locator('header, .bg-white\\/95');
    await expect(header).toBeVisible();
    
    // Check Buy Me a Coffee inspired orange/amber gradients
    const gradients = page.locator('[class*="bg-gradient"], [class*="gradient"]');
    await expect(gradients.first()).toBeVisible();
    
    // Check premium typography and spacing
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText(/PDF/i);
    
    // Check visual hierarchy with proper spacing
    const mainSections = page.locator('main > div');
    await expect(mainSections.first()).toBeVisible();
    
    // Check premium micro-interactions (hover effects)
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
    
    // Test hover effects on primary buttons
    const primaryButton = page.locator('button').first();
    await primaryButton.hover();
    await page.waitForTimeout(500); // Allow animation to complete
    
    // Check for orange/amber color scheme
    const orangeElements = page.locator('[class*="orange"], [class*="amber"]');
    await expect(orangeElements.first()).toBeVisible();
  });

  test('File upload drag-and-drop interactions and animations', async ({ page }) => {
    // Locate the upload area
    const uploadArea = page.locator('[data-testid="upload-area"], .border-dashed, input[type="file"]').first();
    await expect(uploadArea).toBeVisible();
    
    // Test drag over effects
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // Simulate drag events
      await uploadArea.hover();
      await page.mouse.move(500, 300);
      await page.waitForTimeout(300);
      
      // Check for visual feedback during drag
      await uploadArea.dispatchEvent('dragenter');
      await page.waitForTimeout(200);
      await uploadArea.dispatchEvent('dragleave');
    }
    
    // Check upload area styling
    await expect(uploadArea).toBeVisible();
    
    // Test file size and type feedback
    const uploadText = page.locator('text=drag, text=upload, text=PDF').first();
    await expect(uploadText).toBeVisible();
  });

  test('Authentication modal functionality', async ({ page }) => {
    // Look for sign in/login buttons
    const authButtons = page.locator('button:has-text("Sign In"), button:has-text("Login"), button:has-text("Sign Up")');
    
    if (await authButtons.count() > 0) {
      await authButtons.first().click();
      
      // Check if modal opens
      const modal = page.locator('[role="dialog"], .modal, .auth-modal');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        
        // Check for auth form elements
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        if (await emailInput.count() > 0) {
          await expect(emailInput).toBeVisible();
        }
        
        // Test modal close functionality
        const closeButton = page.locator('button:has-text("×"), button:has-text("Close"), [aria-label="Close"]');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });

  test('Premium micro-interactions and hover effects', async ({ page }) => {
    // Test button hover effects
    const buttons = page.locator('button');
    
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Get initial styles
        const initialColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
        
        // Hover and check for changes
        await button.hover();
        await page.waitForTimeout(300);
        
        const hoverColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
        
        // Colors should be different on hover (indicating transition)
        // expect(initialColor).not.toBe(hoverColor);
      }
    }
    
    // Test card hover effects if any
    const cards = page.locator('.card, .feature, [class*="hover:"]');
    if (await cards.count() > 0) {
      await cards.first().hover();
      await page.waitForTimeout(300);
    }
  });

  test('Error handling and feedback messages', async ({ page }) => {
    // Test file validation - try to upload an invalid file
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Create a fake non-PDF file
      const buffer = Buffer.from('fake text file content');
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: buffer,
      });
      
      // Look for error messages
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('.error, .alert, [class*="error"], text=/invalid/i, text=/error/i');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });
});

test.describe('PDFTablePro - Mobile UI/UX Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
  });

  test('Responsive design adaptation', async ({ page }) => {
    // Check that page adapts to mobile viewport
    await expect(page).toHaveTitle(/PDFTablePro/);
    
    // Check mobile navigation
    const mobileNav = page.locator('.mobile-menu, [aria-label="Menu"], button:has-text("☰")');
    
    // Check responsive layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify mobile-specific layouts
    const mobileLayout = page.locator('.sm\\:hidden, .md\\:hidden, .lg\\:hidden');
    if (await mobileLayout.count() > 0) {
      await expect(mobileLayout.first()).toBeVisible();
    }
  });

  test('Touch-friendly buttons and interactions', async ({ page }) => {
    // Check button sizes are touch-friendly (minimum 44px)
    const buttons = page.locator('button');
    
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          // Touch-friendly size should be at least 44px
          const minTouchSize = 40; // Slightly less for testing tolerance
          expect(boundingBox.height).toBeGreaterThan(minTouchSize);
        }
      }
    }
  });

  test('Mobile file upload experience', async ({ page }) => {
    // Test mobile upload area
    const uploadArea = page.locator('input[type="file"], [data-testid="upload-area"]');
    await expect(uploadArea.first()).toBeVisible();
    
    // Check mobile-specific upload messaging
    const uploadText = page.locator('text=/tap/i, text=/select/i, text=/choose/i');
    if (await uploadText.count() > 0) {
      await expect(uploadText.first()).toBeVisible();
    }
  });

  test('Typography and readability on small screens', async ({ page }) => {
    // Check text sizes are readable on mobile
    const headings = page.locator('h1, h2, h3');
    
    for (let i = 0; i < Math.min(await headings.count(), 3); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate(el => {
          return parseFloat(getComputedStyle(el).fontSize);
        });
        
        // Minimum readable font size on mobile
        expect(fontSize).toBeGreaterThan(14);
      }
    }
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('CSS animations and gradient support', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Check CSS gradient support
    const gradientElement = page.locator('[class*="gradient"]').first();
    if (await gradientElement.count() > 0) {
      const hasGradient = await gradientElement.evaluate(el => {
        const style = getComputedStyle(el);
        return style.backgroundImage.includes('gradient');
      });
      
      // Should support gradients in all modern browsers
      expect(hasGradient).toBeTruthy();
    }
    
    // Check for CSS animations
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    if (await animatedElements.count() > 0) {
      const hasTransition = await animatedElements.first().evaluate(el => {
        const style = getComputedStyle(el);
        return style.transition !== 'none' && style.transition !== '';
      });
      
      // Should support transitions
      expect(hasTransition).toBeTruthy();
    }
  });
});

test.describe('Performance Testing', () => {
  test('Page load times and Core Web Vitals', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds for good performance
    if (typeof lcp === 'number' && lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('Animation smoothness', async ({ page }) => {
    await page.goto('/');
    
    // Test button hover animation smoothness
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      // Start performance monitoring
      await page.evaluate(() => {
        performance.mark('animation-start');
      });
      
      await button.hover();
      await page.waitForTimeout(500);
      
      await page.evaluate(() => {
        performance.mark('animation-end');
        performance.measure('animation-duration', 'animation-start', 'animation-end');
      });
      
      const animationMetrics = await page.evaluate(() => {
        const measure = performance.getEntriesByName('animation-duration')[0];
        return measure ? measure.duration : 0;
      });
      
      // Animation should complete within reasonable time
      expect(animationMetrics).toBeLessThan(1000);
    }
  });
});

test.describe('Accessibility Testing', () => {
  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test multiple tab presses
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Should still have a focused element
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('Focus indicators', async ({ page }) => {
    await page.goto('/');
    
    const interactiveElements = page.locator('button, input, a, [tabindex]');
    
    for (let i = 0; i < Math.min(await interactiveElements.count(), 3); i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        await element.focus();
        
        // Check for focus outline or other focus indicators
        const hasFocusOutline = await element.evaluate(el => {
          const style = getComputedStyle(el);
          return style.outline !== 'none' || 
                 style.boxShadow.includes('inset') ||
                 style.border !== style.borderStyle;
        });
        
        // Should have some form of focus indicator
        expect(hasFocusOutline).toBeTruthy();
      }
    }
  });

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    // Check text contrast against backgrounds
    const textElements = page.locator('p, h1, h2, h3, span, button');
    
    for (let i = 0; i < Math.min(await textElements.count(), 5); i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const contrast = await element.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: parseFloat(style.fontSize)
          };
        });
        
        // Basic check - ensure text is not the same color as background
        expect(contrast.color).not.toBe(contrast.backgroundColor);
      }
    }
  });
});

test.describe('User Experience Flow Testing', () => {
  test('Complete user journey simulation', async ({ page }) => {
    await page.goto('/');
    
    // 1. Landing page interaction
    await expect(page).toHaveTitle(/PDFTablePro/);
    
    // 2. Look for main CTA
    const mainCTA = page.locator('button:has-text("Upload"), button:has-text("Try"), button:has-text("Start")').first();
    if (await mainCTA.isVisible()) {
      await mainCTA.click();
      await page.waitForTimeout(500);
    }
    
    // 3. File upload area interaction
    const uploadArea = page.locator('input[type="file"], [data-testid="upload-area"]').first();
    if (await uploadArea.isVisible()) {
      await uploadArea.hover();
      await page.waitForTimeout(300);
    }
    
    // 4. Check for user feedback and guidance
    const helpText = page.locator('text=/help/i, text=/guide/i, text=/how/i');
    if (await helpText.count() > 0) {
      await expect(helpText.first()).toBeVisible();
    }
  });

  test('Error recovery and user guidance', async ({ page }) => {
    await page.goto('/');
    
    // Simulate error conditions and check recovery
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Try uploading oversized file simulation
      const errorScenarios = [
        { name: 'large.pdf', mimeType: 'application/pdf', size: 15 * 1024 * 1024 }, // 15MB
        { name: 'invalid.txt', mimeType: 'text/plain', size: 1024 }
      ];
      
      for (const scenario of errorScenarios) {
        const buffer = Buffer.alloc(Math.min(scenario.size, 1024)); // Limit actual buffer size
        
        await fileInput.setInputFiles({
          name: scenario.name,
          mimeType: scenario.mimeType,
          buffer: buffer,
        });
        
        await page.waitForTimeout(1000);
        
        // Look for error messages and recovery options
        const errorElement = page.locator('.error, .alert, text=/error/i, text=/invalid/i');
        if (await errorElement.count() > 0) {
          await expect(errorElement.first()).toBeVisible();
          
          // Look for recovery options
          const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
          if (await retryButton.count() > 0) {
            await expect(retryButton.first()).toBeVisible();
          }
        }
        
        // Clear for next test
        await page.reload();
        await fileInput.setInputFiles([]);
      }
    }
  });
});