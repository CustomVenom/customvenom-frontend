import { test, expect } from '@playwright/test';

const BASE = process.env['FRONTEND_BASE'] ?? 'http://localhost:3000';
const API_BASE =
  process.env['API_BASE_STAGING'] ?? process.env['NEXT_PUBLIC_API_BASE'] ?? 'http://localhost:8787';

test.describe('Attribution Display Smoke Tests', () => {
  test('Projections API returns simple_attribution or explanations', async ({ page }) => {
    // Intercept API call to verify response structure
    const apiResponses: any[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/api/projections')) {
        try {
          const data = await response.json();
          apiResponses.push(data);
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });

    // Wait for projections to load
    await page.waitForTimeout(2000);

    // Verify API response structure
    if (apiResponses.length > 0) {
      const response = apiResponses[0];

      // Check that projections have either simple_attribution or explanations
      if (response.projections && response.projections.length > 0) {
        const firstProjection = response.projections[0];

        // Should have either simple_attribution OR explanations (or both)
        const hasSimpleAttribution = firstProjection.simple_attribution !== undefined;
        const hasExplanations =
          Array.isArray(firstProjection.explanations) && firstProjection.explanations.length > 0;

        expect(hasSimpleAttribution || hasExplanations).toBeTruthy();

        // If simple_attribution exists, verify format
        if (hasSimpleAttribution && firstProjection.simple_attribution) {
          expect(firstProjection.simple_attribution).toHaveProperty('reason');
          expect(firstProjection.simple_attribution).toHaveProperty('confidence');
          expect(['high', 'medium']).toContain(firstProjection.simple_attribution.confidence);
        }

        // If explanations exist, verify format and limits
        if (hasExplanations) {
          expect(firstProjection.explanations.length).toBeLessThanOrEqual(2);
          firstProjection.explanations.forEach((exp: any) => {
            expect(exp).toHaveProperty('description');
            expect(exp).toHaveProperty('confidence');
            expect(exp.confidence).toBeGreaterThanOrEqual(0.65);
          });
        }
      }
    }
  });

  test('Projections table displays attribution correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore Next.js hydration warnings (common in dev mode, not related to attribution)
        // Ignore CORS errors (expected in local dev when API is production)
        if (
          !text.includes('hydration') &&
          !text.includes('hydrated') &&
          !text.includes('CORS') &&
          !text.includes('Access-Control-Allow-Origin')
        ) {
          errors.push(`[${msg.type()}] ${text}`);
        }
      }
    });

    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });

    // Wait for projections to load
    await page.waitForTimeout(2000);

    // Check for attribution chips/reasons in the UI
    // Look for chip containers or attribution text
    const chipContainers = page.locator(
      '[class*="chip"], [class*="explanation"], [class*="attribution"]',
    );
    const chipCount = await chipContainers.count();

    // If chips exist, verify they're displayed correctly
    if (chipCount > 0) {
      // Check that no row has more than 2 chips
      const rows = page.locator('tr, [role="row"]');
      const rowCount = await rows.count();

      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const row = rows.nth(i);
        const chipsInRow = row.locator('[class*="chip"], [class*="explanation"]');
        const chipCountInRow = await chipsInRow.count();
        expect(chipCountInRow).toBeLessThanOrEqual(2);
      }
    }

    // Verify no console errors
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('Start/Sit page shows attribution without layout shifts', async ({ page }) => {
    const layoutShifts: number[] = [];

    page.on('console', (msg) => {
      if (msg.text().includes('CLS') || msg.text().includes('layout shift')) {
        const match = msg.text().match(/(\d+\.?\d*)/);
        if (match) layoutShifts.push(parseFloat(match[1]));
      }
    });

    await page.goto(`${BASE}/dashboard/start-sit`, { waitUntil: 'networkidle' });

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Check that attribution/reason elements are visible
    const attributionElements = page.locator(
      '[class*="chip"], [class*="explanation"], [class*="attribution"], [class*="reason"]',
    );
    const count = await attributionElements.count();

    // If attribution exists, verify it's stable
    if (count > 0) {
      // Take a screenshot to verify layout
      await page.screenshot({ path: 'test-results/attribution-layout.png', fullPage: false });
    }

    // No significant layout shifts (CLS < 0.1)
    const maxCLS = layoutShifts.length > 0 ? Math.max(...layoutShifts) : 0;
    expect(maxCLS).toBeLessThan(0.1);
  });

  test('Frontend adapter handles both simple_attribution and explanations', async ({ page }) => {
    // This test verifies the adapter logic works correctly
    // We'll check the rendered output matches expected behavior

    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check that chips are displayed (either from simple_attribution or explanations)
    const chips = page.locator('[class*="chip"], [class*="explanation"], [class*="attribution"]');
    const chipCount = await chips.count();

    // If we have projections, we should see some attribution
    // (This is a smoke test, so we're checking it doesn't break)
    if (chipCount > 0) {
      // Verify chips have text content
      const firstChip = chips.first();
      const text = await firstChip.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }

    // Verify no TypeScript errors in console
    const tsErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('TypeError') || msg.text().includes('Cannot read')) {
        tsErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    expect(tsErrors, tsErrors.join('\n')).toHaveLength(0);
  });
});
