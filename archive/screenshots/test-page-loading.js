// Page Loading Audit Script for PDFTablePro
const { chromium } = require('playwright');

async function auditAllPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Define all routes to test
  const routes = [
    '/',
    '/pricing',
    '/features',
    '/help',
    '/terms',
    '/privacy',
    '/api/health'  // Backend health check
  ];

  const results = [];

  console.log('🔍 Starting comprehensive page loading audit...\n');

  for (const route of routes) {
    try {
      console.log(`Testing: ${route}`);
      const url = `http://localhost:3000${route}`;
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      const status = response.status();
      const title = await page.title();
      
      // Check for error indicators
      const errorMessages = await page.$$eval('[data-testid*="error"], .error, .not-found', 
        elements => elements.map(el => el.textContent));
      
      // Check for loading states
      const isLoading = await page.$('[data-testid="loading"]') !== null;
      
      // Take screenshot for documentation
      await page.screenshot({ 
        path: `page-audit-${route.replace('/', 'home').replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true 
      });
      
      results.push({
        route,
        status,
        title,
        success: status === 200 && !isLoading,
        errors: errorMessages,
        screenshot: `page-audit-${route.replace('/', 'home').replace(/[^a-zA-Z0-9]/g, '-')}.png`
      });
      
      console.log(`  ✅ Status: ${status} | Title: "${title}"`);
      if (errorMessages.length > 0) {
        console.log(`  ❌ Errors found: ${errorMessages.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to load: ${error.message}`);
      results.push({
        route,
        status: 'ERROR',
        success: false,
        error: error.message,
        screenshot: null
      });
    }
  }

  // Test navigation flow
  console.log('\n🔍 Testing navigation flow...');
  try {
    await page.goto('http://localhost:3000');
    
    // Test header navigation
    const pricingLink = page.locator('a[href="/pricing"]');
    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      await page.waitForURL('**/pricing');
      console.log('  ✅ Header navigation to pricing works');
      
      // Test logo click back to home
      const logo = page.locator('a[href="/"]').first();
      if (await logo.count() > 0) {
        await logo.click();
        await page.waitForURL('**/');
        console.log('  ✅ Logo navigation to home works');
      }
    }
    
  } catch (navError) {
    console.log(`  ❌ Navigation error: ${navError.message}`);
  }

  await browser.close();

  // Generate summary report
  console.log('\n📊 PAGE LOADING AUDIT SUMMARY');
  console.log('=====================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful pages: ${successful.length}/${routes.length}`);
  console.log(`❌ Failed pages: ${failed.length}/${routes.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED PAGES:');
    failed.forEach(page => {
      console.log(`  • ${page.route}: ${page.error || `Status ${page.status}`}`);
    });
  }
  
  console.log('\n📸 Screenshots saved for all tested pages');
  return results;
}

auditAllPages().catch(console.error);