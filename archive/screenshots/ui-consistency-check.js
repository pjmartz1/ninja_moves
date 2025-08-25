// UI Consistency & Theme Verification
const { chromium } = require('playwright');

async function uiConsistencyCheck() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🎨 Starting UI consistency and orange theme verification...\n');

  const pages = [
    { name: 'Homepage', url: '/' },
    { name: 'Pricing', url: '/pricing' },
    { name: 'Features', url: '/features' },
    { name: 'Help Center', url: '/help' },
    { name: 'Terms of Service', url: '/terms' },
    { name: 'Privacy Policy', url: '/privacy' }
  ];

  const results = [];

  for (const pageInfo of pages) {
    try {
      await page.goto(`http://localhost:3000${pageInfo.url}`, { waitUntil: 'domcontentloaded' });
      console.log(`\n🔍 Checking ${pageInfo.name} page...`);

      // Take full page screenshot
      await page.screenshot({ 
        path: `ui-check-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });

      const pageResults = {
        page: pageInfo.name,
        checks: []
      };

      // Check 1: Header consistency
      try {
        const header = await page.locator('header').first();
        const headerBg = await header.getAttribute('class');
        const hasCorrectHeader = headerBg && headerBg.includes('border-orange') && headerBg.includes('bg-white');
        
        pageResults.checks.push({
          test: 'Header consistency',
          status: hasCorrectHeader ? 'passed' : 'failed',
          details: hasCorrectHeader ? 'Header has consistent orange border and white background' : 'Header styling inconsistent'
        });
        
        console.log(`  ${hasCorrectHeader ? '✅' : '❌'} Header consistency`);
      } catch (error) {
        pageResults.checks.push({ test: 'Header consistency', status: 'error', details: error.message });
      }

      // Check 2: Logo consistency
      try {
        const logo = await page.locator('header a[href="/"]').first();
        const logoIcon = await logo.locator('.bg-gradient-to-br').first();
        const logoClasses = await logoIcon.getAttribute('class');
        const hasOrangeLogo = logoClasses && logoClasses.includes('from-orange-500') && logoClasses.includes('to-amber-600');
        
        pageResults.checks.push({
          test: 'Logo orange theme',
          status: hasOrangeLogo ? 'passed' : 'failed',
          details: hasOrangeLogo ? 'Logo uses consistent orange gradient' : 'Logo gradient inconsistent'
        });
        
        console.log(`  ${hasOrangeLogo ? '✅' : '❌'} Logo orange theme`);
      } catch (error) {
        pageResults.checks.push({ test: 'Logo orange theme', status: 'error', details: error.message });
      }

      // Check 3: Primary button styling (orange buttons)
      try {
        const orangeButtons = await page.locator('button, .btn').filter({ hasText: /sign up|try free|start|pricing/i }).count();
        const orangeButtonsPresent = orangeButtons > 0;
        
        if (orangeButtonsPresent) {
          // Check if buttons have orange styling
          const firstOrangeButton = await page.locator('button, .btn').filter({ hasText: /sign up|try free|start/i }).first();
          const buttonClass = await firstOrangeButton.getAttribute('class');
          const hasOrangeStyle = buttonClass && (buttonClass.includes('orange') || buttonClass.includes('from-orange'));
          
          pageResults.checks.push({
            test: 'Orange button theme',
            status: hasOrangeStyle ? 'passed' : 'failed',
            details: hasOrangeStyle ? 'Primary buttons use orange theme' : 'Button styling inconsistent'
          });
          
          console.log(`  ${hasOrangeStyle ? '✅' : '❌'} Orange button theme`);
        } else {
          pageResults.checks.push({
            test: 'Orange button theme',
            status: 'skipped',
            details: 'No primary buttons found on this page'
          });
          console.log(`  ⚠️ Orange button theme (no buttons found)`);
        }
      } catch (error) {
        pageResults.checks.push({ test: 'Orange button theme', status: 'error', details: error.message });
      }

      // Check 4: Footer consistency
      try {
        const footer = await page.locator('footer').first();
        const footerBg = await footer.getAttribute('class');
        const hasConsistentFooter = footerBg && (footerBg.includes('orange') || footerBg.includes('amber'));
        
        pageResults.checks.push({
          test: 'Footer consistency',
          status: hasConsistentFooter ? 'passed' : 'failed',
          details: hasConsistentFooter ? 'Footer uses consistent orange/amber theme' : 'Footer styling inconsistent'
        });
        
        console.log(`  ${hasConsistentFooter ? '✅' : '❌'} Footer consistency`);
      } catch (error) {
        pageResults.checks.push({ test: 'Footer consistency', status: 'error', details: error.message });
      }

      // Check 5: Text content consistency (looking for proper headings)
      try {
        const mainHeading = await page.locator('h1').first();
        const headingExists = await mainHeading.count() > 0;
        
        if (headingExists) {
          const headingText = await mainHeading.textContent();
          const headingClass = await mainHeading.getAttribute('class');
          const hasProperStyling = headingClass && (headingClass.includes('font-black') || headingClass.includes('font-bold'));
          
          pageResults.checks.push({
            test: 'Typography consistency',
            status: hasProperStyling ? 'passed' : 'failed',
            details: hasProperStyling ? `Main heading properly styled: "${headingText}"` : 'Heading styling inconsistent'
          });
          
          console.log(`  ${hasProperStyling ? '✅' : '❌'} Typography consistency`);
        } else {
          pageResults.checks.push({
            test: 'Typography consistency',
            status: 'failed',
            details: 'No main heading (h1) found'
          });
          console.log(`  ❌ Typography consistency (no h1)`);
        }
      } catch (error) {
        pageResults.checks.push({ test: 'Typography consistency', status: 'error', details: error.message });
      }

      // Check 6: Color scheme verification (orange theme elements)
      try {
        // Look for any orange/amber themed elements
        const orangeElements = await page.locator('[class*="orange"], [class*="amber"]').count();
        const hasOrangeTheme = orangeElements >= 3; // Should have at least header, footer, and some accents
        
        pageResults.checks.push({
          test: 'Orange color scheme',
          status: hasOrangeTheme ? 'passed' : 'warning',
          details: `Found ${orangeElements} orange/amber themed elements`
        });
        
        console.log(`  ${hasOrangeTheme ? '✅' : '⚠️'} Orange color scheme (${orangeElements} elements)`);
      } catch (error) {
        pageResults.checks.push({ test: 'Orange color scheme', status: 'error', details: error.message });
      }

      results.push(pageResults);

    } catch (error) {
      console.log(`❌ Failed to check ${pageInfo.name}: ${error.message}`);
      results.push({
        page: pageInfo.name,
        checks: [{ test: 'Page load', status: 'failed', details: error.message }]
      });
    }
  }

  // Test responsive design on key pages
  console.log('\n📱 Testing responsive design...');
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    await page.screenshot({ 
      path: `responsive-${viewport.name.toLowerCase()}.png`,
      fullPage: true 
    });
    
    console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}) screenshot taken`);
  }

  await browser.close();

  // Generate comprehensive report
  console.log('\n📊 UI CONSISTENCY CHECK SUMMARY');
  console.log('======================================');

  let totalChecks = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  let totalErrors = 0;

  results.forEach(pageResult => {
    console.log(`\n${pageResult.page}:`);
    pageResult.checks.forEach(check => {
      totalChecks++;
      const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      console.log(`  ${icon} ${check.test}: ${check.details}`);
      
      if (check.status === 'passed') totalPassed++;
      else if (check.status === 'failed') totalFailed++;
      else if (check.status === 'warning') totalWarnings++;
      else if (check.status === 'error') totalErrors++;
    });
  });

  console.log(`\n📈 OVERALL RESULTS:`);
  console.log(`✅ Passed: ${totalPassed}/${totalChecks} (${Math.round(totalPassed/totalChecks*100)}%)`);
  console.log(`❌ Failed: ${totalFailed}/${totalChecks}`);
  console.log(`⚠️ Warnings: ${totalWarnings}/${totalChecks}`);
  console.log(`🔧 Errors: ${totalErrors}/${totalChecks}`);

  const overallGrade = totalPassed / totalChecks;
  if (overallGrade >= 0.9) {
    console.log('\n🎉 EXCELLENT UI CONSISTENCY! Ready for production.');
  } else if (overallGrade >= 0.8) {
    console.log('\n👍 GOOD UI CONSISTENCY! Minor improvements recommended.');
  } else if (overallGrade >= 0.7) {
    console.log('\n⚠️ FAIR UI CONSISTENCY. Several improvements needed.');
  } else {
    console.log('\n❌ POOR UI CONSISTENCY. Major improvements required before production.');
  }

  console.log('\n📸 Screenshots saved for all pages and viewport sizes');
  return results;
}

uiConsistencyCheck().catch(console.error);