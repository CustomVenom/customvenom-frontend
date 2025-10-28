import { test, expect } from '@playwright/test';

test.describe('Leagues Selection', () => {
  test('After OAuth, user lands on /tools/leagues', async ({ page }) => {
    await page.goto('/api/yahoo/callback?code=bad&state=bad');
    // Should redirect to /tools/leagues via canonical redirect
    await expect(page).toHaveURL(/\/tools\/leagues/);
  });

  test('Connect shows leagues table with entitlements', async ({ page }) => {
    // Mock the /app/me/leagues API endpoint
    await page.route('/app/me/leagues', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connections: [{ provider: 'yahoo', connected_at: new Date().toISOString() }],
          leagues: [
            {
              key: 'yahoo:123:tmA',
              provider: 'yahoo',
              external_league_id: '123',
              team_id: 'tmA',
              name: 'League A',
              season: '2025',
              team_name: 'Team A',
            },
            {
              key: 'yahoo:456:tmB',
              provider: 'yahoo',
              external_league_id: '456',
              team_id: 'tmB',
              name: 'League B',
              season: '2025',
              team_name: 'Team B',
            },
          ],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 0,
          },
          synced_leagues: [],
          active_league: null,
        }),
      }),
    );

    await page.goto('/tools/leagues');

    // Should show the leagues table
    await expect(page.getByText('League A')).toBeVisible();
    await expect(page.getByText('League B')).toBeVisible();

    // Should show slot meter
    await expect(page.getByText('0 of 1 used')).toBeVisible();
  });

  test('One-slot enforcement - disable unchecked boxes when at capacity', async ({ page }) => {
    await page.route('/app/me/leagues', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connections: [{ provider: 'yahoo', connected_at: new Date().toISOString() }],
          leagues: [
            {
              key: 'yahoo:123:tmA',
              provider: 'yahoo',
              external_league_id: '123',
              team_id: 'tmA',
              name: 'League A',
              season: '2025',
              team_name: 'Team A',
            },
            {
              key: 'yahoo:456:tmB',
              provider: 'yahoo',
              external_league_id: '456',
              team_id: 'tmB',
              name: 'League B',
              season: '2025',
              team_name: 'Team B',
            },
          ],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 1,
          },
          synced_leagues: ['yahoo:123:tmA'],
          active_league: 'yahoo:123:tmA',
        }),
      }),
    );

    await page.goto('/tools/leagues');

    // Should show slot meter with 1 of 1 used
    await expect(page.getByText('1 of 1 used')).toBeVisible();

    // The synced league checkbox should be enabled
    const syncedCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(syncedCheckbox).toBeEnabled();

    // The unsynced league checkbox should be disabled
    const unsyncedCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await expect(unsyncedCheckbox).toBeDisabled();
  });

  test('Superuser can sync unlimited leagues', async ({ page }) => {
    await page.route('/app/me/leagues', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connections: [{ provider: 'yahoo', connected_at: new Date().toISOString() }],
          leagues: [
            {
              key: 'yahoo:123:tmA',
              provider: 'yahoo',
              external_league_id: '123',
              team_id: 'tmA',
              name: 'League A',
              season: '2025',
              team_name: 'Team A',
            },
            {
              key: 'yahoo:456:tmB',
              provider: 'yahoo',
              external_league_id: '456',
              team_id: 'tmB',
              name: 'League B',
              season: '2025',
              team_name: 'Team B',
            },
          ],
          entitlements: {
            is_superuser: true,
            free_slots: 0,
            purchased_slots: 0,
            max_sync_slots: Infinity,
            used_slots: 0,
          },
          synced_leagues: [],
          active_league: null,
        }),
      }),
    );

    await page.goto('/tools/leagues');

    // Should show unlimited slots for superuser
    await expect(page.getByText('0 of ∞ used')).toBeVisible();

    // All checkboxes should be enabled
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeEnabled();
    }
  });

  test('LeagueSwitcher shows when synced leagues exist', async ({ page }) => {
    await page.route('/app/me/leagues', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connections: [{ provider: 'yahoo', connected_at: new Date().toISOString() }],
          leagues: [
            {
              key: 'yahoo:123:tmA',
              provider: 'yahoo',
              external_league_id: '123',
              team_id: 'tmA',
              name: 'League A',
              season: '2025',
              team_name: 'Team A',
            },
            {
              key: 'yahoo:456:tmB',
              provider: 'yahoo',
              external_league_id: '456',
              team_id: 'tmB',
              name: 'League B',
              season: '2025',
              team_name: 'Team B',
            },
          ],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 1,
          },
          synced_leagues: ['yahoo:123:tmA'],
          active_league: 'yahoo:123:tmA',
        }),
      }),
    );

    await page.goto('/tools/leagues');

    // LeagueSwitcher should be visible in the tabs area
    await expect(page.getByText('Active League:')).toBeVisible();

    // Should show the active league name
    await expect(page.getByRole('combobox')).toContainText('League A');
  });
});
