const { chromium } = require('playwright');

async function testWaveVisibility() {
  console.log('🔍 Starting wave visibility test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down actions
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for the page to fully load
    await page.waitForTimeout(2000);
    
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'wave-visibility-full.png', 
      fullPage: true 
    });
    
    console.log('📸 Taking viewport screenshot...');
    await page.screenshot({ 
      path: 'wave-visibility-viewport.png', 
      fullPage: false 
    });
    
    // Inspect DOM for wave-related elements
    console.log('🔍 Inspecting DOM for wave components...');
    
    // Check for any elements with "wave" in class name or ID
    const waveElements = await page.$$eval('[class*="wave"], [id*="wave"]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 200) + '...',
        computedStyle: {
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity,
          height: window.getComputedStyle(el).height,
          width: window.getComputedStyle(el).width,
          position: window.getComputedStyle(el).position,
          zIndex: window.getComputedStyle(el).zIndex
        }
      }))
    );
    
    // Check for SVG elements (waves are often SVGs)
    const svgElements = await page.$$eval('svg', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className.baseVal || el.className,
        innerHTML: el.innerHTML.substring(0, 300) + '...',
        viewBox: el.getAttribute('viewBox'),
        width: el.getAttribute('width'),
        height: el.getAttribute('height'),
        computedStyle: {
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity
        }
      }))
    );
    
    // Check the hero section specifically
    console.log('🎯 Inspecting hero section...');
    const heroSection = await page.$eval('main section:first-of-type, .hero, [class*="hero"]', element => {
      if (!element) return null;
      return {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        childrenCount: element.children.length,
        lastChild: {
          tagName: element.lastElementChild?.tagName,
          className: element.lastElementChild?.className,
          innerHTML: element.lastElementChild?.innerHTML.substring(0, 300) + '...'
        },
        computedStyle: {
          height: window.getComputedStyle(element).height,
          position: window.getComputedStyle(element).position,
          overflow: window.getComputedStyle(element).overflow
        }
      };
    }).catch(() => null);
    
    // Look for any hidden elements that might be the wave
    const hiddenElements = await page.$$eval('*', elements => 
      elements
        .filter(el => {
          const style = window.getComputedStyle(el);
          return (
            style.display === 'none' || 
            style.visibility === 'hidden' || 
            style.opacity === '0' ||
            (el.className && el.className.toString().includes('wave'))
          );
        })
        .slice(0, 10) // Limit to first 10 to avoid too much data
        .map(el => ({
          tagName: el.tagName,
          className: el.className.toString(),
          id: el.id,
          innerHTML: el.innerHTML.substring(0, 200) + '...',
          computedStyle: {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity
          }
        }))
    );
    
    // Get page structure
    const pageStructure = await page.evaluate(() => {
      const body = document.body;
      return {
        bodyHeight: body.scrollHeight,
        viewportHeight: window.innerHeight,
        childrenTags: Array.from(body.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          id: child.id
        }))
      };
    });
    
    console.log('\n=== WAVE VISIBILITY TEST RESULTS ===');
    console.log('\n📊 Page Structure:');
    console.log(JSON.stringify(pageStructure, null, 2));
    
    console.log('\n🌊 Wave Elements Found:');
    console.log(waveElements.length > 0 ? JSON.stringify(waveElements, null, 2) : 'No wave elements found');
    
    console.log('\n🎨 SVG Elements Found:');
    console.log(svgElements.length > 0 ? JSON.stringify(svgElements, null, 2) : 'No SVG elements found');
    
    console.log('\n🎯 Hero Section Analysis:');
    console.log(heroSection ? JSON.stringify(heroSection, null, 2) : 'Hero section not found');
    
    console.log('\n👻 Hidden Elements (first 10):');
    console.log(hiddenElements.length > 0 ? JSON.stringify(hiddenElements, null, 2) : 'No hidden elements found');
    
    console.log('\n📸 Screenshots saved:');
    console.log('- wave-visibility-full.png (full page)');
    console.log('- wave-visibility-viewport.png (viewport only)');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
  
  // Keep browser open for manual inspection
  console.log('\n🔍 Browser kept open for manual inspection. Press any key to close...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
  console.log('✅ Test completed!');
}

testWaveVisibility().catch(console.error);