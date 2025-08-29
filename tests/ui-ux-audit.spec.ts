import { test, expect, Page } from '@playwright/test'

test.describe('PDFTablePro - UI/UX Audit', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('🔍 1. USAGE WIDGET/COUNTER ANALYSIS (TOP PRIORITY)', async () => {
    console.log('\n=== USAGE WIDGET ANALYSIS ===')
    
    // Test 1.1: Check for any usage-related elements on homepage (anonymous user)
    console.log('Testing anonymous user experience...')
    const usageElements = await page.locator('[class*="usage"], [class*="Usage"], [data-testid*="usage"]').count()
    console.log(`Found ${usageElements} usage-related elements for anonymous user`)
    
    // Test 1.2: Look for any rate limit or pages remaining indicators
    const rateLimitTexts = ['pages', 'remaining', 'limit', 'usage', 'daily', 'monthly']
    let foundUsageText = false
    
    for (const text of rateLimitTexts) {
      const element = page.locator(`text=${text}`)
      const count = await element.count()
      if (count > 0) {
        console.log(`Found "${text}" text: ${count} instances`)
        foundUsageText = true
      }
    }
    
    if (!foundUsageText) {
      console.log('❌ NO USAGE INDICATORS found for anonymous users')
    }
    
    // Test 1.3: Screenshot the current state
    await page.screenshot({ 
      path: 'usage-widget-anonymous.png', 
      fullPage: true 
    })
  })

  test('🖥️ 2. HOMEPAGE DESIGN ANALYSIS', async () => {
    console.log('\n=== HOMEPAGE DESIGN ANALYSIS ===')
    
    // Test 2.1: Hero Section Analysis
    const heroSection = page.locator('section').first()
    const heroTitle = await page.locator('h1').first().textContent()
    console.log(`Hero title: ${heroTitle}`)
    
    // Test 2.2: Two-column layout verification
    const uploadSection = page.locator('[class*="grid"], [class*="flex"]').filter({ hasText: 'drag' })
    const isColumnsVisible = await uploadSection.count() > 0
    console.log(`Two-column upload layout present: ${isColumnsVisible}`)
    
    // Test 2.3: Orange theme consistency
    const orangeElements = await page.locator('[class*="orange"], [class*="amber"]').count()
    console.log(`Orange/amber themed elements: ${orangeElements}`)
    
    // Test 2.4: Features section
    const featuresSection = page.locator('section').filter({ hasText: 'Lightning Fast' })
    const featuresVisible = await featuresSection.count() > 0
    console.log(`Features section present: ${featuresVisible}`)
    
    await page.screenshot({ path: 'homepage-full.png', fullPage: true })
  })

  test('🧭 3. NAVIGATION ANALYSIS', async () => {
    console.log('\n=== NAVIGATION ANALYSIS ===')
    
    // Test 3.1: Logo clickability
    const logo = page.locator('a[href="/"]').first()
    const logoClickable = await logo.count() > 0
    console.log(`Logo is clickable: ${logoClickable}`)
    
    // Test 3.2: Header navigation links
    const navLinks = ['Features', 'Pricing', 'Help Center']
    for (const linkText of navLinks) {
      const link = page.locator(`a:has-text("${linkText}")`)
      const exists = await link.count() > 0
      console.log(`${linkText} link exists: ${exists}`)
      
      if (linkText === 'Pricing') {
        // Test pricing page navigation
        await link.click()
        await page.waitForLoadState('networkidle')
        const currentUrl = page.url()
        console.log(`Pricing page URL: ${currentUrl}`)
        
        // Take screenshot of pricing page
        await page.screenshot({ path: 'pricing-page.png', fullPage: true })
        
        // Go back to home
        await page.goto('http://localhost:3000')
        await page.waitForLoadState('networkidle')
      }
    }
    
    // Test 3.3: Mobile navigation (hamburger menu)
    await page.setViewportSize({ width: 375, height: 667 })
    const hamburgerMenu = page.locator('[aria-label="Menu"], button:has([data-lucide="menu"])')
    const mobileMenuExists = await hamburgerMenu.count() > 0
    console.log(`Mobile hamburger menu exists: ${mobileMenuExists}`)
    
    if (mobileMenuExists) {
      await hamburgerMenu.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'mobile-menu.png' })
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('📱 4. RESPONSIVE DESIGN TESTING', async () => {
    console.log('\n=== RESPONSIVE DESIGN ANALYSIS ===')
    
    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]
    
    for (const breakpoint of breakpoints) {
      console.log(`Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`)
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await page.waitForTimeout(500)
      
      // Check if content is readable
      const heroText = await page.locator('h1').first().textContent()
      const isReadable = heroText && heroText.length > 10
      console.log(`${breakpoint.name} - Hero text readable: ${isReadable}`)
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      console.log(`${breakpoint.name} - Has horizontal scroll: ${hasHorizontalScroll}`)
      
      await page.screenshot({ 
        path: `responsive-${breakpoint.name.toLowerCase()}.png`,
        fullPage: true 
      })
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('🎨 5. UI COMPONENT QUALITY', async () => {
    console.log('\n=== UI COMPONENT QUALITY ANALYSIS ===')
    
    // Test 5.1: Button consistency
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    console.log(`Total buttons found: ${buttonCount}`)
    
    // Test 5.2: shadcn/ui components
    const shadcnClasses = ['bg-primary', 'text-primary', 'border-input', 'ring-ring']
    let shadcnUsage = 0
    for (const className of shadcnClasses) {
      const count = await page.locator(`[class*="${className}"]`).count()
      shadcnUsage += count
    }
    console.log(`shadcn/ui themed elements: ${shadcnUsage}`)
    
    // Test 5.3: Loading states
    const loadingElements = await page.locator('[class*="animate-pulse"], [class*="loading"]').count()
    console.log(`Loading state elements: ${loadingElements}`)
    
    // Test 5.4: Test file upload functionality
    const fileInput = page.locator('input[type="file"]')
    const dragDropArea = page.locator('[class*="drag"], [class*="drop"]')
    
    const fileInputExists = await fileInput.count() > 0
    const dragDropExists = await dragDropArea.count() > 0
    
    console.log(`File input exists: ${fileInputExists}`)
    console.log(`Drag & drop area exists: ${dragDropExists}`)
    
    if (dragDropExists) {
      await page.screenshot({ path: 'file-upload-area.png' })
    }
  })

  test('⚡ 6. PERFORMANCE & LOADING', async () => {
    console.log('\n=== PERFORMANCE ANALYSIS ===')
    
    // Reload page and measure load time
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    
    // Check for render-blocking resources
    const scripts = await page.locator('script').count()
    const stylesheets = await page.locator('link[rel="stylesheet"]').count()
    
    console.log(`Scripts loaded: ${scripts}`)
    console.log(`Stylesheets loaded: ${stylesheets}`)
    
    // Core Web Vitals simulation
    const metrics = await page.evaluate(() => {
      return {
        readyState: document.readyState,
        visibilityState: document.visibilityState
      }
    })
    
    console.log('Page metrics:', metrics)
  })
})