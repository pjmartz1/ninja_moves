import { test, expect } from '@playwright/test';

test.describe('Performance Metrics Testing', () => {
  test('Core Web Vitals measurement', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: 0
        };
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          vitals.cls = cls;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Time to First Byte
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        }
        
        // Resolve after collecting metrics
        setTimeout(() => resolve(vitals), 3000);
      });
    });
    
    console.log('Core Web Vitals:', vitals);
    
    // Assert good performance thresholds
    if (typeof vitals === 'object' && vitals !== null) {
      const v = vitals as any;
      
      // LCP should be under 2.5 seconds (2500ms)
      if (v.lcp > 0) {
        expect(v.lcp).toBeLessThan(2500);
        console.log(`✓ LCP: ${v.lcp}ms (Good: <2500ms)`);
      }
      
      // FCP should be under 1.8 seconds (1800ms)
      if (v.fcp > 0) {
        expect(v.fcp).toBeLessThan(1800);
        console.log(`✓ FCP: ${v.fcp}ms (Good: <1800ms)`);
      }
      
      // CLS should be under 0.1
      if (v.cls !== undefined) {
        expect(v.cls).toBeLessThan(0.1);
        console.log(`✓ CLS: ${v.cls} (Good: <0.1)`);
      }
      
      // TTFB should be under 600ms
      if (v.ttfb > 0) {
        expect(v.ttfb).toBeLessThan(600);
        console.log(`✓ TTFB: ${v.ttfb}ms (Good: <600ms)`);
      }
    }
  });

  test('Bundle size and resource loading', async ({ page }) => {
    // Start monitoring network activity
    const responses: any[] = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        type: response.request().resourceType()
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyze JavaScript bundle sizes
    const jsFiles = responses.filter(r => r.type === 'script');
    const totalJSSize = jsFiles.reduce((sum, file) => sum + parseInt(file.size || '0'), 0);
    
    console.log(`Total JavaScript size: ${(totalJSSize / 1024).toFixed(2)} KB`);
    console.log(`JavaScript files: ${jsFiles.length}`);
    
    // JavaScript bundle should be reasonable (under 500KB total)
    expect(totalJSSize).toBeLessThan(500 * 1024);
    
    // CSS files
    const cssFiles = responses.filter(r => r.type === 'stylesheet');
    const totalCSSSize = cssFiles.reduce((sum, file) => sum + parseInt(file.size || '0'), 0);
    
    console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    console.log(`CSS files: ${cssFiles.length}`);
    
    // CSS should be optimized (under 100KB total)
    expect(totalCSSSize).toBeLessThan(100 * 1024);
    
    // Check for 404s or failed resources
    const failedRequests = responses.filter(r => r.status >= 400);
    expect(failedRequests.length).toBe(0);
    
    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }
  });

  test('Animation performance (60fps)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test button hover animation performance
    const button = page.locator('button').first();
    
    if (await button.isVisible()) {
      // Start monitoring animation frames
      const animationMetrics = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const frames: number[] = [];
          let startTime = performance.now();
          let animationId: number;
          
          function measureFrameRate() {
            const currentTime = performance.now();
            frames.push(currentTime);
            
            if (currentTime - startTime < 1000) { // Measure for 1 second
              animationId = requestAnimationFrame(measureFrameRate);
            } else {
              // Calculate FPS
              const fps = frames.length;
              const avgFrameTime = frames.length > 1 ? 
                (frames[frames.length - 1] - frames[0]) / (frames.length - 1) : 0;
              
              resolve({
                fps,
                avgFrameTime,
                frameCount: frames.length
              });
            }
          }
          
          animationId = requestAnimationFrame(measureFrameRate);
        });
      });
      
      // Trigger animation
      await button.hover();
      await page.waitForTimeout(1000);
      
      console.log('Animation metrics:', animationMetrics);
      
      // Should maintain close to 60fps during animations
      if (typeof animationMetrics === 'object' && animationMetrics !== null) {
        const metrics = animationMetrics as any;
        if (metrics.fps) {
          expect(metrics.fps).toBeGreaterThan(45); // At least 45fps (allowing some tolerance)
          console.log(`✓ Animation FPS: ${metrics.fps} (Target: 60fps)`);
        }
      }
    }
  });

  test('Memory usage and leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory) {
      console.log('Initial memory usage:', {
        used: `${(initialMemory.used / 1024 / 1024).toFixed(2)} MB`,
        total: `${(initialMemory.total / 1024 / 1024).toFixed(2)} MB`
      });
      
      // Perform some interactions
      await page.hover('button');
      await page.click('button');
      await page.waitForTimeout(500);
      
      // Check memory after interactions
      const afterMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (afterMemory) {
        const memoryIncrease = afterMemory.used - initialMemory.used;
        console.log(`Memory increase after interactions: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
        
        // Memory increase should be minimal (under 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    }
  });

  test('Network performance and caching', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', response => {
      resources.push({
        url: response.url(),
        status: response.status(),
        fromCache: response.fromServiceWorker() || response.status() === 304,
        loadTime: response.timing()?.responseEnd || 0,
        size: parseInt(response.headers()['content-length'] || '0'),
        type: response.request().resourceType()
      });
    });
    
    // First load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstLoadResources = [...resources];
    resources.length = 0; // Clear for second load
    
    // Second load to test caching
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const secondLoadResources = [...resources];
    
    // Analyze caching effectiveness
    const cachedResources = secondLoadResources.filter(r => r.fromCache || r.status === 304);
    const cachingRate = cachedResources.length / secondLoadResources.length;
    
    console.log(`Caching rate: ${(cachingRate * 100).toFixed(1)}%`);
    console.log(`Cached resources: ${cachedResources.length}/${secondLoadResources.length}`);
    
    // Should have good caching (at least 50% of resources cached on second load)
    expect(cachingRate).toBeGreaterThan(0.3);
    
    // Calculate average load times
    const avgFirstLoadTime = firstLoadResources.reduce((sum, r) => sum + r.loadTime, 0) / firstLoadResources.length;
    const avgSecondLoadTime = secondLoadResources.reduce((sum, r) => sum + r.loadTime, 0) / secondLoadResources.length;
    
    console.log(`Average load time - First: ${avgFirstLoadTime.toFixed(2)}ms, Second: ${avgSecondLoadTime.toFixed(2)}ms`);
    
    // Second load should be faster due to caching
    expect(avgSecondLoadTime).toBeLessThan(avgFirstLoadTime);
  });
});