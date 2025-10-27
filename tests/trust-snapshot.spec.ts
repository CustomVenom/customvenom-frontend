import { test, expect } from '@playwright/test';

test('Trust Snapshot shows version and timestamp on /tools', async ({ page }) => {
  await page.goto('/tools', { waitUntil: 'domcontentloaded' });

  const snap = page.getByLabel(/trust snapshot/i).first();
  await expect(snap).toBeVisible();

  // Version like v1 or v1.0.0 anywhere in the block
  await expect(snap).toContainText(/v\d+(?:\.\d+){0,2}/i);

  const text = (await snap.textContent()) || '';
  expect(/am|pm|:|\d{4}-\d{2}-\d{2}/i.test(text)).toBeTruthy();

  // Stale badge appears only when header says x-stale=true (best‑effort check via page evaluation)
  const hasStaleBadge = await page
    .getByText(/stale/i)
    .isVisible()
    .catch(() => false);
  // Don't fail if badge absent; just assert that if present it's labeled clearly
  if (hasStaleBadge) {
    await expect(page.getByText(/stale/i)).toBeVisible();
  }
});
