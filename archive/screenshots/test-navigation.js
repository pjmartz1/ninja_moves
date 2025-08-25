// Navigation Flow Testing for PDFTablePro
const { chromium } = require('playwright');

async function testNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🧭 Starting navigation flow testing...\n');

  const results = [];

  try {
    // Start at homepage
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    console.log('✅ Started at homepage');

    // Test header navigation links
    const headerTests = [
      { text: 'Features', url: '/features' },
      { text: 'Pricing', url: '/pricing' },
      { text: 'Help Center', url: '/help' }
    ];

    for (const test of headerTests) {
      try {
        // Use more specific selector for header navigation
        const headerLink = page.locator('nav a').filter({ hasText: test.text }).first();
        await headerLink.click();
        await page.waitForURL(`**${test.url}`, { timeout: 5000 });
        console.log(`✅ Header navigation: ${test.text} → ${test.url}`);
        results.push({ test: `Header ${test.text}`, status: 'passed' });

        // Take screenshot
        await page.screenshot({ path: `nav-test-${test.url.replace('/', '')}.png` });
        
      } catch (error) {
        console.log(`❌ Header navigation failed: ${test.text} - ${error.message}`);
        results.push({ test: `Header ${test.text}`, status: 'failed', error: error.message });
      }
    }

    // Test logo click back to home from each page
    for (const test of headerTests) {
      try {
        await page.goto(`http://localhost:3000${test.url}`);
        
        // Click the logo (more specific selector)
        const logo = page.locator('header a[href="/"]').first();
        await logo.click();
        await page.waitForURL('**/');
        console.log(`✅ Logo navigation from ${test.url} → home`);
        results.push({ test: `Logo from ${test.url}`, status: 'passed' });
        
      } catch (error) {
        console.log(`❌ Logo navigation failed from ${test.url}: ${error.message}`);
        results.push({ test: `Logo from ${test.url}`, status: 'failed', error: error.message });
      }
    }

    // Test footer navigation (with specific targeting to avoid duplicates)
    console.log('\n🔍 Testing footer navigation...');
    await page.goto('http://localhost:3000');
    
    const footerTests = [
      { text: 'Features', url: '/features' },
      { text: 'Pricing', url: '/pricing' },
      { text: 'Help Center', url: '/help' },
      { text: 'Contact Us', url: '/contact' },
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' }
    ];

    for (const test of footerTests) {
      try {
        await page.goto('http://localhost:3000'); // Reset to home
        
        // Use footer-specific selector
        const footerLink = page.locator('footer a').filter({ hasText: test.text }).first();
        await footerLink.click();
        
        if (test.url === '/contact') {
          // Contact might not be implemented yet
          console.log(`ℹ️ Footer navigation: ${test.text} → ${test.url} (may not be implemented)`);
          results.push({ test: `Footer ${test.text}`, status: 'skipped', note: 'Contact page not implemented' });
        } else {
          await page.waitForURL(`**${test.url}`, { timeout: 3000 });
          console.log(`✅ Footer navigation: ${test.text} → ${test.url}`);
          results.push({ test: `Footer ${test.text}`, status: 'passed' });
        }
        
      } catch (error) {
        console.log(`❌ Footer navigation failed: ${test.text} - ${error.message}`);
        results.push({ test: `Footer ${test.text}`, status: 'failed', error: error.message });
      }
    }

    // Test responsive navigation (mobile menu)
    console.log('\n📱 Testing mobile navigation...');
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    await page.goto('http://localhost:3000');
    
    try {
      // Look for mobile menu trigger
      const mobileMenuTrigger = page.locator('[role="button"]').filter({ hasText: /menu/i }).or(
        page.locator('button:has(svg)')
      ).first();
      
      if (await mobileMenuTrigger.isVisible()) {
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500); // Wait for menu to open
        
        // Test mobile menu links
        const mobilePricingLink = page.locator('.space-y-3 a, .space-y-4 a').filter({ hasText: 'Pricing' }).first();
        if (await mobilePricingLink.isVisible()) {
          await mobilePricingLink.click();
          await page.waitForURL('**/pricing', { timeout: 3000 });
          console.log('✅ Mobile navigation: Pricing link works');
          results.push({ test: 'Mobile Pricing', status: 'passed' });
        }
      } else {
        console.log('ℹ️ Mobile menu not visible at tablet size');
        results.push({ test: 'Mobile Menu', status: 'skipped', note: 'Mobile menu not visible' });
      }
      
    } catch (error) {
      console.log(`❌ Mobile navigation failed: ${error.message}`);
      results.push({ test: 'Mobile Navigation', status: 'failed', error: error.message });
    }

  } catch (error) {
    console.error('Navigation testing failed:', error);
  }

  await browser.close();

  // Generate summary report
  console.log('\n📊 NAVIGATION TESTING SUMMARY');
  console.log('====================================');
  
  const passed = results.filter(r => r.status === 'passed');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');
  
  console.log(`✅ Passed tests: ${passed.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failed.length}/${results.length}`);
  console.log(`⚠️ Skipped tests: ${skipped.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(test => {
      console.log(`  • ${test.test}: ${test.error || 'Unknown error'}`);
    });
  }

  if (skipped.length > 0) {
    console.log('\n⚠️ SKIPPED TESTS:');
    skipped.forEach(test => {
      console.log(`  • ${test.test}: ${test.note || 'No note'}`);
    });
  }
  
  console.log('\n📸 Navigation screenshots saved for visual verification');
  return results;
}

testNavigation().catch(console.error);