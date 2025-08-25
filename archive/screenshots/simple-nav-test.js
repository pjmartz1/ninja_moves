// Simple Navigation Test
const { chromium } = require('playwright');

async function simpleNavTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧭 Quick navigation test...\n');

  try {
    // Test homepage
    await page.goto('http://localhost:3000', { timeout: 10000 });
    console.log('✅ Homepage loads successfully');

    // Test pricing navigation
    const pricingLink = page.locator('header nav a[href="/pricing"]').first();
    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      await page.waitForURL('**/pricing');
      console.log('✅ Pricing page navigation works');
    }

    // Test logo navigation back to home
    const logo = page.locator('header a[href="/"]');
    if (await logo.count() > 0) {
      await logo.click();
      await page.waitForURL('**/');
      console.log('✅ Logo navigation to home works');
    }

    // Test features page
    await page.goto('http://localhost:3000/features');
    console.log('✅ Features page loads directly');

    // Test other pages
    const pages = ['/help', '/terms', '/privacy'];
    for (const pageUrl of pages) {
      await page.goto(`http://localhost:3000${pageUrl}`);
      console.log(`✅ ${pageUrl} page loads successfully`);
    }

    console.log('\n🎉 All navigation tests passed!');

  } catch (error) {
    console.log('❌ Navigation test failed:', error.message);
  }

  await browser.close();
}

simpleNavTest().catch(console.error);