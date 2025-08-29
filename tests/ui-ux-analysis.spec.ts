import { test, expect, Page, Browser, BrowserContext } from '@playwright/test'
import { readFileSync } from 'fs'
import path from 'path'

const FRONTEND_URL = 'http://localhost:3005'
const TEST_PDF_PATH = path.join(__dirname, 'sample-table.pdf')

test.describe('PDFTablePro UI/UX Analysis', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    })
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('1. Complete User Journey Flow Analysis', async () => {
    console.log('\n📊 ANALYZING COMPLETE USER JOURNEY FLOW')
    
    // Step 1: Landing Page Load
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    const loadTime = await page.evaluate(() => {
      return performance.now()
    })
    console.log(`✅ Landing page load time: ${loadTime.toFixed(2)}ms`)
    
    // Step 2: Header Elements Check
    const logoVisible = await page.locator('header a[href="/"]').isVisible()
    const pricingLink = await page.locator('header a[href="/pricing"]').isVisible()
    const loginButton = await page.locator('header button:has-text("Login")').isVisible()
    const signupButton = await page.locator('header button:has-text("Sign Up")').isVisible()
    
    console.log(`📍 Header Navigation:`)
    console.log(`   - Logo clickable: ${logoVisible}`)
    console.log(`   - Pricing link: ${pricingLink}`)
    console.log(`   - Login button: ${loginButton}`)
    console.log(`   - Sign Up button: ${signupButton}`)
    
    // Step 3: Hero Section Analysis
    const heroTitle = await page.locator('h1:has-text("PDF to Excel")').isVisible()
    const heroSubtitle = await page.textContent('p:has-text("accuracy")')
    
    console.log(`🎯 Hero Section:`)
    console.log(`   - Title present: ${heroTitle}`)
    console.log(`   - Accuracy claim: ${heroSubtitle?.includes('accuracy')}`)
    
    // Step 4: Upload Area Visibility
    const uploadArea = await page.locator('[data-testid="file-uploader"], .dropzone').first()
    const uploadVisible = await uploadArea.isVisible()
    const uploadButton = await page.locator('button:has-text("Choose File")').isVisible()
    
    console.log(`📁 Upload Interface:`)
    console.log(`   - Upload area visible: ${uploadVisible}`)
    console.log(`   - Choose File button: ${uploadButton}`)
    
    // Step 5: Requirements Section
    const requirementsCards = await page.locator('.space-y-4 > .bg-white\\/80').count()
    console.log(`   - Requirements cards: ${requirementsCards}`)
    
    // Step 6: Features Section
    const featuresSection = await page.locator('section:has(h2:has-text("Features"), h3:has-text("Lightning Fast"))').isVisible()
    console.log(`   - Features section: ${featuresSection}`)
    
    // Step 7: Footer Analysis
    const footer = await page.locator('footer').isVisible()
    const footerLogo = await page.locator('footer div:has(svg)').isVisible()
    
    console.log(`🦶 Footer:`)
    console.log(`   - Footer present: ${footer}`)
    console.log(`   - Footer logo: ${footerLogo}`)
    
    expect(logoVisible).toBe(true)
    expect(uploadVisible).toBe(true)
    expect(featuresSection).toBe(true)
  })

  test('2. Navigation Consistency Analysis', async () => {
    console.log('\n🧭 ANALYZING NAVIGATION CONSISTENCY')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Test logo navigation
    const logoLink = page.locator('header a[href="/"]')
    await expect(logoLink).toBeVisible()
    
    // Test pricing navigation
    const pricingLink = page.locator('header a[href="/pricing"]')
    if (await pricingLink.isVisible()) {
      console.log('✅ Pricing link found - testing navigation')
      await pricingLink.click()
      await page.waitForLoadState('networkidle')
      
      const currentUrl = page.url()
      console.log(`   - Navigated to: ${currentUrl}`)
      
      // Test back navigation via logo
      await logoLink.click()
      await page.waitForLoadState('networkidle')
      
      const backToHome = page.url()
      console.log(`   - Back to home: ${backToHome}`)
    }
    
    // Test mobile menu
    await page.setViewportSize({ width: 768, height: 1024 })
    const mobileMenuButton = page.locator('header button[aria-label*="menu"], header button:has(svg):not(:has-text("Login")):not(:has-text("Sign Up"))')
    
    if (await mobileMenuButton.first().isVisible()) {
      console.log('✅ Mobile menu button visible')
      await mobileMenuButton.first().click()
      
      const mobileNav = page.locator('[role="dialog"], .sheet-content, nav')
      await expect(mobileNav.first()).toBeVisible()
      console.log('   - Mobile navigation opens successfully')
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('3. Upload Workflow UX Analysis', async () => {
    console.log('\n📤 ANALYZING UPLOAD WORKFLOW UX')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Test drag and drop area
    const dropzone = page.locator('.dropzone, [data-testid="dropzone"]').first()
    await expect(dropzone).toBeVisible()
    
    // Test choose file button
    const chooseFileButton = page.locator('button:has-text("Choose File")')
    const buttonVisible = await chooseFileButton.isVisible()
    console.log(`📁 Choose File Button: ${buttonVisible}`)
    
    if (buttonVisible) {
      // Test button interaction
      await chooseFileButton.hover()
      
      // Check for hover effects
      const buttonClasses = await chooseFileButton.getAttribute('class')
      console.log(`   - Button has hover styling: ${buttonClasses?.includes('hover:') || buttonClasses?.includes('group')}`)
    }
    
    // Test error states
    const errorDisplay = page.locator('.bg-gradient-to-r.from-red-50, .border-red-200')
    const errorVisible = await errorDisplay.isVisible()
    console.log(`❌ Error state UI: ${errorVisible ? 'Present' : 'Not visible (good)'}`)
    
    // Test file requirements visibility
    const requirements = await page.locator('h3:has-text("File Requirements")').isVisible()
    const requirementCards = await page.locator('.space-y-4 .bg-white\\/80').count()
    
    console.log(`📋 File Requirements:`)
    console.log(`   - Requirements section: ${requirements}`)
    console.log(`   - Requirement cards: ${requirementCards}`)
    
    // Test pro tips
    const proTips = await page.locator('h4:has-text("Pro Tips"), .bg-gradient-to-r.from-orange-50').isVisible()
    console.log(`   - Pro tips section: ${proTips}`)
  })

  test('4. Missing UX Elements Analysis', async () => {
    console.log('\n🔍 IDENTIFYING MISSING UX ELEMENTS')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Check for usage widget
    const usageWidget = await page.locator('[data-testid="usage-widget"], .usage-indicator, :has-text("remaining")').count()
    console.log(`📊 Usage Widget: ${usageWidget > 0 ? '✅ Present' : '❌ Missing'}`)
    
    // Check for user dashboard when logged out
    const userDashboard = await page.locator('[data-testid="user-dashboard"], .dashboard').isVisible()
    console.log(`👤 User Dashboard (logged out): ${userDashboard ? '✅ Present' : '❌ Missing (expected for anonymous users)'}`)
    
    // Check for progress indicators
    const progressBar = await page.locator('.progress, [role="progressbar"]').isVisible()
    console.log(`⏳ Progress Indicators: ${progressBar ? '✅ Present' : '❌ Missing (shown during upload)'}`)
    
    // Check for loading states
    const loadingSkeletons = await page.locator('.animate-pulse').count()
    console.log(`💀 Loading Skeletons: ${loadingSkeletons} elements`)
    
    // Check for success/error feedback
    const feedbackElements = await page.locator('.success, .error, .notification, .alert').count()
    console.log(`✅ Feedback Elements: ${feedbackElements} elements`)
    
    // Check for trust indicators
    const trustBadges = await page.locator('.security, .badge, .certification').count()
    const accuracyStats = await page.locator(':has-text("95%"), :has-text("accuracy")').count()
    
    console.log(`🛡️ Trust Indicators:`)
    console.log(`   - Security badges: ${trustBadges}`)
    console.log(`   - Accuracy stats: ${accuracyStats}`)
    
    // Check for social proof
    const testimonials = await page.locator('.testimonial, .review').count()
    const userCount = await page.locator(':has-text("users"), :has-text("customers")').count()
    
    console.log(`👥 Social Proof:`)
    console.log(`   - Testimonials: ${testimonials}`)
    console.log(`   - User counts: ${userCount}`)
  })

  test('5. Mobile Responsiveness Analysis', async () => {
    console.log('\n📱 ANALYZING MOBILE RESPONSIVENESS')
    
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 }
    ]
    
    for (const viewport of viewports) {
      console.log(`\n📲 Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(FRONTEND_URL)
      await page.waitForLoadState('networkidle')
      
      // Check header layout
      const headerLogo = await page.locator('header h1').isVisible()
      const mobileMenu = await page.locator('header button:has(svg):not(:has-text("Login"))').isVisible()
      
      console.log(`   - Header logo visible: ${headerLogo}`)
      console.log(`   - Mobile menu button: ${mobileMenu}`)
      
      // Check upload area layout
      const uploadArea = await page.locator('.dropzone').first()
      const uploadBounds = await uploadArea.boundingBox()
      
      if (uploadBounds) {
        const appropriateSize = uploadBounds.width > viewport.width * 0.8
        console.log(`   - Upload area appropriate size: ${!appropriateSize} (${uploadBounds.width}px wide)`)
      }
      
      // Check two-column layout adaptation
      const columnsOnMobile = await page.locator('.grid-cols-1.lg\\:grid-cols-2').isVisible()
      console.log(`   - Responsive grid layout: ${columnsOnMobile}`)
      
      // Check touch targets
      const buttons = await page.locator('button').all()
      let adequateTouchTargets = 0
      
      for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
        const bounds = await button.boundingBox()
        if (bounds && bounds.height >= 44) { // 44px is iOS minimum
          adequateTouchTargets++
        }
      }
      
      console.log(`   - Adequate touch targets: ${adequateTouchTargets}/${Math.min(buttons.length, 3)}`)
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('6. Accessibility Compliance Analysis', async () => {
    console.log('\n♿ ANALYZING ACCESSIBILITY COMPLIANCE')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Check for semantic HTML
    const mainElement = await page.locator('main').count()
    const headerElement = await page.locator('header').count()
    const footerElement = await page.locator('footer').count()
    
    console.log(`🏗️ Semantic HTML:`)
    console.log(`   - <main> elements: ${mainElement}`)
    console.log(`   - <header> elements: ${headerElement}`)
    console.log(`   - <footer> elements: ${footerElement}`)
    
    // Check for heading hierarchy
    const h1Count = await page.locator('h1').count()
    const h2Count = await page.locator('h2').count()
    const h3Count = await page.locator('h3').count()
    
    console.log(`📝 Heading Hierarchy:`)
    console.log(`   - H1: ${h1Count} (should be 1)`)
    console.log(`   - H2: ${h2Count}`)
    console.log(`   - H3: ${h3Count}`)
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    let imagesWithAlt = 0
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      if (alt !== null) {
        imagesWithAlt++
      }
    }
    
    console.log(`🖼️ Images: ${imagesWithAlt}/${images.length} have alt text`)
    
    // Check for form labels
    const inputs = await page.locator('input').all()
    let inputsWithLabels = 0
    
    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label')
      const id = await input.getAttribute('id')
      const label = id ? await page.locator(`label[for="${id}"]`).count() : 0
      
      if (ariaLabel || label > 0) {
        inputsWithLabels++
      }
    }
    
    console.log(`📝 Form Inputs: ${inputsWithLabels}/${inputs.length} have labels`)
    
    // Check color contrast (basic check)
    const textElements = await page.locator('h1, h2, h3, p, span').all()
    console.log(`🎨 Text elements found: ${textElements.length}`)
    
    // Check for keyboard navigation
    const focusableElements = await page.locator('a, button, input, [tabindex]:not([tabindex="-1"])').count()
    console.log(`⌨️ Focusable elements: ${focusableElements}`)
  })

  test('7. Visual Hierarchy Analysis', async () => {
    console.log('\n🎨 ANALYZING VISUAL HIERARCHY')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Analyze font sizes
    const h1Styles = await page.locator('h1').first().evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color
      }
    })
    
    console.log(`📏 H1 Typography:`)
    console.log(`   - Font size: ${h1Styles.fontSize}`)
    console.log(`   - Font weight: ${h1Styles.fontWeight}`)
    console.log(`   - Color: ${h1Styles.color}`)
    
    // Check CTA prominence
    const primaryCTA = page.locator('button:has-text("Choose File"), button:has-text("Upload")')
    const ctaStyles = await primaryCTA.first().evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        padding: styles.padding,
        borderRadius: styles.borderRadius
      }
    })
    
    console.log(`🎯 Primary CTA Styling:`)
    console.log(`   - Background: ${ctaStyles.backgroundColor}`)
    console.log(`   - Padding: ${ctaStyles.padding}`)
    console.log(`   - Border radius: ${ctaStyles.borderRadius}`)
    
    // Check spacing consistency
    const sections = await page.locator('section, .container').all()
    console.log(`📐 Layout sections: ${sections.length}`)
    
    // Check color scheme consistency
    const orangeElements = await page.locator('.text-orange-600, .bg-orange-500, .border-orange-100').count()
    console.log(`🟠 Orange theme elements: ${orangeElements}`)
  })

  test('8. Conversion Optimization Analysis', async () => {
    console.log('\n💰 ANALYZING CONVERSION OPTIMIZATION')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Analyze CTA placement
    const aboveFoldCTAs = await page.locator('button').evaluateAll(buttons => {
      return buttons.filter(button => {
        const rect = button.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.top > 0
      }).length
    })
    
    console.log(`🎯 CTAs above the fold: ${aboveFoldCTAs}`)
    
    // Check for urgency indicators
    const urgencyText = await page.locator(':has-text("free"), :has-text("now"), :has-text("instant"), :has-text("fast")').count()
    console.log(`⚡ Urgency indicators: ${urgencyText}`)
    
    // Check for value propositions
    const valueProps = await page.locator(':has-text("95%"), :has-text("secure"), :has-text("fast"), :has-text("free")').count()
    console.log(`💎 Value propositions: ${valueProps}`)
    
    // Check for friction points
    const formFields = await page.locator('input[required]').count()
    const signupRequired = await page.locator(':has-text("sign up"), :has-text("register")').count()
    
    console.log(`🚧 Potential friction:`)
    console.log(`   - Required form fields: ${formFields}`)
    console.log(`   - Signup mentions: ${signupRequired}`)
    
    // Check for social proof
    const socialProof = await page.locator(':has-text("users"), :has-text("customers"), .testimonial, .review').count()
    console.log(`👥 Social proof elements: ${socialProof}`)
    
    // Check pricing transparency
    const pricingMentions = await page.locator(':has-text("free"), :has-text("$"), :has-text("price"), :has-text("cost")').count()
    console.log(`💵 Pricing transparency: ${pricingMentions}`)
  })

  test('9. Performance and Load Analysis', async () => {
    console.log('\n🚀 ANALYZING PERFORMANCE AND LOAD')
    
    const startTime = Date.now()
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`⚡ Page load time: ${loadTime}ms`)
    
    // Check for lazy loading
    const images = await page.locator('img').count()
    const lazyImages = await page.locator('img[loading="lazy"]').count()
    
    console.log(`🖼️ Image optimization:`)
    console.log(`   - Total images: ${images}`)
    console.log(`   - Lazy loaded: ${lazyImages}`)
    
    // Check for largest contentful paint elements
    const mainContent = await page.locator('h1, .hero, .upload').first().isVisible()
    console.log(`📊 Main content visible: ${mainContent}`)
    
    // Check JavaScript bundle size (approximate)
    const networkRequests = []
    page.on('response', response => {
      if (response.url().includes('.js')) {
        networkRequests.push({
          url: response.url(),
          size: response.headers()['content-length'] || 'unknown'
        })
      }
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    console.log(`📦 JavaScript requests: ${networkRequests.length}`)
  })

  test('10. Integration Testing', async () => {
    console.log('\n🔗 INTEGRATION TESTING')
    
    await page.goto(FRONTEND_URL)
    await page.waitForLoadState('networkidle')
    
    // Test authentication modal
    const loginButton = page.locator('button:has-text("Login")')
    if (await loginButton.isVisible()) {
      await loginButton.click()
      
      const modal = page.locator('[role="dialog"], .modal, .auth-modal')
      const modalVisible = await modal.first().isVisible({ timeout: 5000 })
      console.log(`🔐 Login modal opens: ${modalVisible}`)
      
      if (modalVisible) {
        // Close modal
        const closeButton = page.locator('button[aria-label*="close"], button:has-text("×")')
        if (await closeButton.first().isVisible()) {
          await closeButton.first().click()
        } else {
          await page.keyboard.press('Escape')
        }
      }
    }
    
    // Test file upload trigger (without actual file)
    const chooseFile = page.locator('button:has-text("Choose File")')
    if (await chooseFile.isVisible()) {
      await chooseFile.click()
      console.log(`📁 File picker interaction: Triggered`)
    }
    
    console.log('\n✅ UI/UX ANALYSIS COMPLETE')
  })
})

// Test utility functions
async function checkColorContrast(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return null
    
    const styles = window.getComputedStyle(element)
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor
    }
  }, selector)
}

async function getElementMetrics(page: Page, selector: string) {
  return await page.locator(selector).evaluate(el => {
    const rect = el.getBoundingClientRect()
    const styles = window.getComputedStyle(el)
    
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      fontSize: styles.fontSize,
      padding: styles.padding,
      margin: styles.margin
    }
  })
}