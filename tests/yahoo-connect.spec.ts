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
    expect(href).toBe('https://api.customvenom.com/api/connect/start?host=yahoo&from=%2Fsettings');
  });

  test('should complete Yahoo OAuth flow and show connected state', async ({ page }) => {
    // Mock the Workers API response for connect start
    await page.route('**/api/connect/start*', async (route) => {
      // Simulate redirect to Yahoo OAuth
      await route.fulfill({
        status: 302,
        headers: {
          Location:
            'https://api.login.yahoo.com/oauth2/request_auth?client_id=test&redirect_uri=https://api.customvenom.com/api/yahoo/callback&response_type=code&scope=fspt-r&state=test-state',
        },
      });
    });

    // Mock the callback processing
    await page.route('**/api/yahoo/callback*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'https://www.customvenom.com/tools?connected=yahoo',
          'Set-Cookie':
            'cv_yahoo=test-token; Path=/; HttpOnly; Secure; SameSite=None; Domain=.customvenom.com; Max-Age=86400',
        },
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
              season: '2025',
            },
          ],
        }),
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
              manager: 'test-manager',
            },
          ],
        }),
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
              team: 'DAL',
            },
            {
              id: 'test-player-2',
              name: 'Test Player 2',
              pos: 'RB',
              team: 'SF',
            },
          ],
        }),
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
          error: 'Please connect Yahoo to continue.',
        }),
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

  test('should complete /tools connect flow and verify session', async ({ page }) => {
    // Mock the Workers API connect start endpoint
    await page.route('**/api/connect/start*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location:
            'https://api.login.yahoo.com/oauth2/request_auth?client_id=test&redirect_uri=https://api.customvenom.com/api/yahoo/callback&response_type=code&scope=fspt-r&state=test-state',
        },
      });
    });

    // Mock the callback processing
    await page.route('**/api/yahoo/callback*', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: 'https://www.customvenom.com/tools?connected=yahoo',
          'Set-Cookie':
            'y_at=test-token; Path=/; HttpOnly; Secure; SameSite=None; Domain=.customvenom.com; Max-Age=86400',
        },
      });
    });

    // Mock session check endpoint
    await page.route('**/api/yahoo/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasCookie: true,
        }),
      });
    });

    // Mock session/me endpoint
    await page.route('**/api/yahoo/session/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { email: 'test@example.com' },
        }),
      });
    });

    // Start from /tools page
    await page.goto('/tools');
    await page.waitForLoadState('networkidle');

    // Find and click Connect Yahoo button
    const connectButton = page.locator('[data-testid="yahoo-connect-btn"]');
    await expect(connectButton).toBeVisible();
    await connectButton.click();

    // Wait for redirect to Yahoo OAuth
    await page.waitForURL('**/oauth2/request_auth**');

    // Simulate successful OAuth callback
    await page.goto('/tools?connected=yahoo');
    await page.waitForLoadState('networkidle');

    // Verify we're back on the same page with connected parameter
    expect(page.url()).toContain('?connected=yahoo');

    // Test session endpoints
    const sessionResponse = await page.evaluate(async () => {
      const response = await fetch('https://api.customvenom.com/api/yahoo/session', {
        credentials: 'include',
      });
      return response.json();
    });
    expect(sessionResponse.hasCookie).toBe(true);

    const sessionMeResponse = await page.evaluate(async () => {
      const response = await fetch('https://api.customvenom.com/api/yahoo/session/me', {
        credentials: 'include',
      });
      return response.status;
    });
    expect(sessionMeResponse).toBe(200);
  });
});
