import { test, expect } from '@playwright/test'

test.describe('PDFTablePro Comprehensive UI/UX Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Visit the homepage
    await page.goto('http://localhost:3000')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test.describe('1. Navigation Testing', () => {
    
    test('Header navigation links functionality', async ({ page }) => {
      // Test logo clickability and navigation
      await page.click('header a[href="/"]')
      await expect(page).toHaveURL('http://localhost:3000/')
      
      // Test Features link
      await page.click('text="Features"')
      await expect(page).toHaveURL('http://localhost:3000/features')
      
      // Navigate back to home
      await page.goto('http://localhost:3000')
      
      // Test Help Center link
      await page.click('text="Help Center"')
      await expect(page).toHaveURL('http://localhost:3000/help')
      
      // Navigate back to home
      await page.goto('http://localhost:3000')
      
      // Test Pricing link
      await page.click('text="Pricing"')
      await expect(page).toHaveURL('http://localhost:3000/pricing')
    })

    test('Footer navigation links functionality', async ({ page }) => {
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      // Test footer links
      const footerLinks = [
        { text: 'Features', url: '/features' },
        { text: 'Pricing', url: '/pricing' },
        { text: 'Help Center', url: '/help' },
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Terms of Service', url: '/terms' }
      ]
      
      for (const link of footerLinks) {
        await page.goto('http://localhost:3000')
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.click(`footer a[href="${link.url}"]`)
        await expect(page).toHaveURL(`http://localhost:3000${link.url}`)
      }
    })

    test('Mobile hamburger menu functionality', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check if mobile menu toggle exists and is visible
      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰"), .hamburger')
      
      if (await menuButton.count() > 0) {
        await menuButton.first().click()
        
        // Check if mobile menu items are visible
        await expect(page.locator('text="Features"')).toBeVisible()
        await expect(page.locator('text="Help Center"')).toBeVisible()
        await expect(page.locator('text="Pricing"')).toBeVisible()
      }
    })
  })

  test.describe('2. Button Functionality Testing', () => {
    
    test('Authentication buttons trigger modal', async ({ page }) => {
      // Test Sign In button
      const signInButton = page.locator('text="Sign In"').first()
      if (await signInButton.count() > 0) {
        await signInButton.click()
        
        // Check if auth modal appears
        const authModal = page.locator('[role="dialog"], .modal, [data-testid="auth-modal"]')
        await expect(authModal).toBeVisible()
        
        // Close modal
        const closeButton = page.locator('button:has-text("×"), button[aria-label="Close"], button:has-text("Close")')
        if (await closeButton.count() > 0) {
          await closeButton.first().click()
        } else {
          await page.keyboard.press('Escape')
        }
      }
    })

    test('Primary CTA buttons functionality', async ({ page }) => {
      // Test main CTA buttons
      const ctaButtons = page.locator('text="Get Started", text="Try Free Now", text="Start Converting"')
      
      for (let i = 0; i < await ctaButtons.count(); i++) {
        const button = ctaButtons.nth(i)
        await button.scrollIntoViewIfNeeded()
        
        // Check if button is clickable
        await expect(button).toBeEnabled()
        
        // Click and verify action (should either trigger file upload or navigate)
        await button.click()
        
        // Check if file input dialog opens or auth modal appears
        const fileInput = page.locator('input[type="file"]')
        const authModal = page.locator('[role="dialog"], .modal')
        
        const hasFileInput = await fileInput.count() > 0
        const hasAuthModal = await authModal.count() > 0
        
        expect(hasFileInput || hasAuthModal).toBeTruthy()
        
        // Reset state
        if (hasAuthModal) {
          await page.keyboard.press('Escape')
        }
      }
    })

    test('File upload workflow buttons', async ({ page }) => {
      // Test Choose File button
      const chooseFileButton = page.locator('text="Choose File", text="Browse Files", text="Select File"')
      
      if (await chooseFileButton.count() > 0) {
        await chooseFileButton.first().scrollIntoViewIfNeeded()
        await expect(chooseFileButton.first()).toBeEnabled()
        
        // Note: Cannot actually test file selection in automated tests
        // but can verify button is interactive
        await chooseFileButton.first().hover()
      }
    })
  })

  test.describe('3. Authentication Flow Analysis', () => {
    
    test('Authentication modal states', async ({ page }) => {
      // Trigger auth modal
      const signInButton = page.locator('text="Sign In"').first()
      
      if (await signInButton.count() > 0) {
        await signInButton.click()
        
        // Wait for modal to appear
        const authModal = page.locator('[role="dialog"], .modal, [data-testid="auth-modal"]')
        await expect(authModal).toBeVisible()
        
        // Check for sign in form elements
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"]')
        const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]')
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")')
        
        if (await emailInput.count() > 0) {
          await expect(emailInput.first()).toBeVisible()
        }
        if (await passwordInput.count() > 0) {
          await expect(passwordInput.first()).toBeVisible()
        }
        if (await submitButton.count() > 0) {
          await expect(submitButton.first()).toBeVisible()
        }
        
        // Test toggle to sign up
        const signUpToggle = page.locator('text="Sign Up", text="Create Account", text="Register"')
        if (await signUpToggle.count() > 0) {
          await signUpToggle.first().click()
          
          // Should switch to sign up form
          const signUpSubmit = page.locator('button:has-text("Sign Up"), button:has-text("Create Account")')
          if (await signUpSubmit.count() > 0) {
            await expect(signUpSubmit.first()).toBeVisible()
          }
        }
      }
    })

    test('User state management after login attempt', async ({ page }) => {
      // Note: Cannot test actual login without valid credentials
      // This test checks UI state changes
      
      const signInButton = page.locator('text="Sign In"').first()
      
      if (await signInButton.count() > 0) {
        await signInButton.click()
        
        const authModal = page.locator('[role="dialog"], .modal')
        if (await authModal.count() > 0) {
          const emailInput = page.locator('input[type="email"]')
          const passwordInput = page.locator('input[type="password"]')
          
          if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
            // Fill with test data (will fail but we can observe behavior)
            await emailInput.first().fill('test@example.com')
            await passwordInput.first().fill('testpassword')
            
            const submitButton = page.locator('button[type="submit"]')
            if (await submitButton.count() > 0) {
              await submitButton.first().click()
              
              // Wait a moment to see if any loading state appears
              await page.waitForTimeout(1000)
              
              // Check for error messages or loading indicators
              const errorMessage = page.locator('.error, .alert-error, [role="alert"]')
              const loadingIndicator = page.locator('.loading, .spinner, [aria-label="Loading"]')
              
              // Document what we observe
              console.log('Error messages found:', await errorMessage.count())
              console.log('Loading indicators found:', await loadingIndicator.count())
            }
          }
        }
      }
    })
  })

  test.describe('4. User Journey Testing', () => {
    
    test('Complete user journey from landing to conversion', async ({ page }) => {
      // 1. Landing page loads correctly
      await expect(page).toHaveTitle(/PDF to Excel|PDFTablePro/)
      
      // 2. User sees main value proposition
      const heroText = page.locator('h1, .hero h2, .hero-title')
      await expect(heroText.first()).toBeVisible()
      
      // 3. User scrolls to upload section
      const uploadSection = page.locator('.upload, .file-upload, input[type="file"]').first()
      if (await uploadSection.count() > 0) {
        await uploadSection.scrollIntoViewIfNeeded()
        await expect(uploadSection).toBeVisible()
      }
      
      // 4. User sees features section
      const featuresSection = page.locator('.features, .feature-grid, .benefits')
      if (await featuresSection.count() > 0) {
        await featuresSection.first().scrollIntoViewIfNeeded()
        await expect(featuresSection.first()).toBeVisible()
      }
      
      // 5. User explores pricing
      await page.goto('http://localhost:3000/pricing')
      
      const pricingPlans = page.locator('.pricing, .plan, .tier, .package')
      if (await pricingPlans.count() > 0) {
        await expect(pricingPlans.first()).toBeVisible()
      }
    })

    test('File upload to download workflow simulation', async ({ page }) => {
      // Navigate to upload area
      const uploadArea = page.locator('.upload-area, .dropzone, .file-drop')
      
      if (await uploadArea.count() > 0) {
        await uploadArea.first().scrollIntoViewIfNeeded()
        await expect(uploadArea.first()).toBeVisible()
        
        // Check for file requirements/instructions
        const fileRequirements = page.locator('text="PDF", text="Max", text="MB", .requirements, .file-info')
        if (await fileRequirements.count() > 0) {
          await expect(fileRequirements.first()).toBeVisible()
        }
        
        // Check for drag & drop instructions
        const dragDropText = page.locator('text="drag", text="drop", text="browse", text="choose"')
        if (await dragDropText.count() > 0) {
          await expect(dragDropText.first()).toBeVisible()
        }
      }
    })

    test('Error handling and user feedback', async ({ page }) => {
      // Test invalid file upload simulation
      const uploadArea = page.locator('.upload-area, .dropzone, .file-drop')
      
      if (await uploadArea.count() > 0) {
        // Create a test file (this is simulation - actual file upload requires backend integration)
        await uploadArea.first().hover()
        
        // Check if error messages are styled appropriately
        const errorElements = page.locator('.error, .alert-error, .danger, .warning')
        
        // If any error elements exist, check their visibility
        for (let i = 0; i < await errorElements.count(); i++) {
          const element = errorElements.nth(i)
          if (await element.isVisible()) {
            console.log('Error element found:', await element.textContent())
          }
        }
      }
    })
  })

  test.describe('5. UI Flow Consistency and Mobile Responsiveness', () => {
    
    test('Desktop layout consistency', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // Check header layout
      const header = page.locator('header, .header, nav')
      if (await header.count() > 0) {
        await expect(header.first()).toBeVisible()
        
        // Check if logo and navigation are properly aligned
        const logo = page.locator('.logo, .brand, [href="/"]').first()
        const navigation = page.locator('nav, .nav, .navigation')
        
        if (await logo.count() > 0 && await navigation.count() > 0) {
          const logoBox = await logo.boundingBox()
          const navBox = await navigation.first().boundingBox()
          
          if (logoBox && navBox) {
            // Logo should be on left, nav on right
            expect(logoBox.x).toBeLessThan(navBox.x)
          }
        }
      }
      
      // Check main content area
      const mainContent = page.locator('main, .main-content, .container').first()
      if (await mainContent.count() > 0) {
        const contentBox = await mainContent.boundingBox()
        if (contentBox) {
          // Content should be properly centered
          expect(contentBox.width).toBeGreaterThan(800)
        }
      }
    })

    test('Mobile layout responsiveness', async ({ page }) => {
      // Test various mobile breakpoints
      const viewports = [
        { width: 375, height: 667, device: 'iPhone SE' },
        { width: 390, height: 844, device: 'iPhone 12' },
        { width: 360, height: 640, device: 'Galaxy S5' }
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        
        // Check if content adapts to mobile
        const header = page.locator('header, .header')
        if (await header.count() > 0) {
          const headerBox = await header.first().boundingBox()
          if (headerBox) {
            expect(headerBox.width).toBeLessThanOrEqual(viewport.width)
          }
        }
        
        // Check if main content stacks vertically
        const uploadSection = page.locator('.upload, .file-upload').first()
        if (await uploadSection.count() > 0) {
          await uploadSection.scrollIntoViewIfNeeded()
          const uploadBox = await uploadSection.boundingBox()
          if (uploadBox) {
            expect(uploadBox.width).toBeLessThanOrEqual(viewport.width - 32) // Account for padding
          }
        }
        
        // Check if features section adapts
        const features = page.locator('.features, .feature-grid')
        if (await features.count() > 0) {
          await features.first().scrollIntoViewIfNeeded()
          const featuresBox = await features.first().boundingBox()
          if (featuresBox) {
            expect(featuresBox.width).toBeLessThanOrEqual(viewport.width)
          }
        }
      }
    })

    test('Tablet layout responsiveness', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // Check tablet-specific layout
      const container = page.locator('.container, .max-w, main').first()
      if (await container.count() > 0) {
        const containerBox = await container.boundingBox()
        if (containerBox) {
          // Should use most of tablet width
          expect(containerBox.width).toBeGreaterThan(600)
          expect(containerBox.width).toBeLessThan(768)
        }
      }
    })
  })

  test.describe('6. Accessibility Testing', () => {
    
    test('Keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus')
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible()
      }
      
      // Continue tabbing through major elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const currentFocus = page.locator(':focus')
        if (await currentFocus.count() > 0) {
          console.log(`Tab ${i + 1}:`, await currentFocus.getAttribute('tag'))
        }
      }
    })

    test('ARIA labels and semantic HTML', async ({ page }) => {
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      console.log(`Found ${headings.length} headings`)
      
      // Check for alt text on images
      const images = await page.locator('img').all()
      for (const img of images) {
        const altText = await img.getAttribute('alt')
        if (!altText || altText.trim() === '') {
          console.log('Image missing alt text:', await img.getAttribute('src'))
        }
      }
      
      // Check for form labels
      const inputs = await page.locator('input').all()
      for (const input of inputs) {
        const label = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count()
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        
        if (label === 0 && !ariaLabel && !ariaLabelledBy) {
          console.log('Input missing label:', await input.getAttribute('type'))
        }
      }
    })
  })

  test.describe('7. Social Media Elements Audit', () => {
    
    test('Identify social media elements for cleanup', async ({ page }) => {
      // Look for social media icons and links
      const socialElements = [
        'a[href*="twitter.com"]',
        'a[href*="facebook.com"]', 
        'a[href*="linkedin.com"]',
        'a[href*="instagram.com"]',
        'a[href*="youtube.com"]',
        '.social-media',
        '.social-links',
        '.social-icons',
        '[class*="twitter"]',
        '[class*="facebook"]', 
        '[class*="linkedin"]',
        '[class*="instagram"]',
        'text="Follow us"',
        'text="Connect with us"'
      ]
      
      const foundSocialElements = []
      
      for (const selector of socialElements) {
        const elements = page.locator(selector)
        const count = await elements.count()
        
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i)
            const text = await element.textContent()
            const href = await element.getAttribute('href')
            const className = await element.getAttribute('class')
            
            foundSocialElements.push({
              selector,
              text: text?.trim(),
              href,
              className,
              isVisible: await element.isVisible()
            })
          }
        }
      }
      
      console.log('Social media elements found:', JSON.stringify(foundSocialElements, null, 2))
      
      // Document findings
      if (foundSocialElements.length > 0) {
        console.log(`Found ${foundSocialElements.length} social media elements that need cleanup`)
      } else {
        console.log('No social media elements found - cleanup may already be complete')
      }
    })
  })
})