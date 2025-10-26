import { test, expect } from '@playwright/test';

test.describe('Yahoo Connect Flow', () => {
  test('should have correct Connect Yahoo button href', async ({ page }) => {
    await page.goto('/settings');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the Connect Yahoo button and verify its href
    const connectButton = page.locator('[data-testid="yahoo-connect-btn"]');
    await expect(connectButton).toBeVisible();

    const href = await connectButton.getAttribute('href');
    expect(href).toBe('https://www.customvenom.com/api/yahoo/connect?returnTo=/settings'));
  });

  test('should complete Yahoo OAuth flow and show connected state', async ({ page }) => {
    // Mock the Workers API response for leagues
    await page.route('**/api/yahoo/connect', async (route) => {
      // Simulate redirect to Yahoo OAuth
      await route.fulfill({
        status: 302,
        headers: {
          'Location': 'https://api.login.yahoo.com/oauth2/request_auth?client_id=test&redirect_uri=https://www.customvenom.com/api/auth/callback/yahoo&response_type=code&scope=fspt-r&state=test-state'
        }
      });
    });

    // Mock the callback processing
    await page.route('**/api/auth/callback/yahoo*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/settings',
          'Set-Cookie': 'y_at=test-token; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.customvenom.com; Max-Age=3600'
        }
      });
    });

    // Mock the leagues API response
    await page.route('**/yahoo/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
          leagues: [
            {
              key: 'test-league-key',
              name: 'Test Fantasy League',
              season: '2025'
            }
          ]
        })
      });
    });

    // Mock the teams API response
    await page.route('**/yahoo/leagues/test-league-key/teams', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
          teams: [
            {
              key: 'test-team-key',
              name: 'Test Team',
              manager: 'test-manager'
            }
          ]
        })
      });
    });

    // Mock the roster API response
    await page.route('**/yahoo/team/test-team-key/roster', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
          players: [
            {
              id: 'test-player-1',
              name: 'Test Player 1',
              pos: 'QB',
              team: 'DAL'
            },
            {
              id: 'test-player-2',
              name: 'Test Player 2',
              pos: 'RB',
              team: 'SF'
            }
          ]
        })
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Click Connect Yahoo button
    const connectButton = page.locator('[data-testid="yahoo-connect-btn"]');
    await expect(connectButton).toBeVisible();
    await connectButton.click();

    // Wait for redirect to Yahoo OAuth
    await page.waitForURL('**/oauth2/request_auth**');

    // Simulate successful OAuth callback
    await page.goto('/settings?yahoo_connected=true');
    await page.waitForLoadState('networkidle');

    // Verify connected state
    const connectedElement = page.locator('[data-testid="yahoo-connected"]');
    await expect(connectedElement).toBeVisible();
    await expect(connectedElement).toContainText('Yahoo Connected');
    await expect(connectedElement).toContainText('Test Fantasy League');
    await expect(connectedElement).toContainText('2025');

    // Verify roster table is shown
    const rosterTable = page.locator('table');
    await expect(rosterTable).toBeVisible();

    // Check for player data
    await expect(page.locator('text=Test Player 1')).toBeVisible();
    await expect(page.locator('text=Test Player 2')).toBeVisible();
  });

  test('should handle Yahoo connection errors gracefully', async ({ page }) => {
    // Mock error response from leagues API
    await page.route('**/yahoo/leagues', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Please connect Yahoo to continue.'
        })
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Should show "not connected" state
    const notConnectedText = page.locator('text=Yahoo: not connected');
    await expect(notConnectedText).toBeVisible();

    // Connect button should be visible
    const connectButton = page.locator('[data-testid="yahoo-connect-btn"]');
    await expect(connectButton).toBeVisible();
  });
});
