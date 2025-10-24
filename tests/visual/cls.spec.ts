import { test, expect } from '@playwright/test';

test.describe('CLS Performance', () => {
  const pages = ['/tools', '/projections'];
  
  for (const path of pages) {
    test(`CLS should be below 0.1 on ${path} page`, async ({ page }) => {
      // Enable performance monitoring
      await page.goto(path);
      
      // Measure CLS by checking for layout shifts
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if ('value' in entry) {
                clsValue += entry.value as number;
              }
            }
            resolve(clsValue);
          });
          
          observer.observe({ type: 'layout-shift', buffered: true });
          
          // Resolve after a short delay to capture shifts
          setTimeout(() => {
            observer.disconnect();
            resolve(0);
          }, 2000);
        });
      });
      
      // CLS should be < 0.1 for good UX
      expect(Number(cls)).toBeLessThan(0.1);
    });
  }
});
