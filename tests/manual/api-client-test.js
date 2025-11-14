// Manual API Client Dedup/Abort Test Script
// Run this in browser console on http://localhost:3000/players

// Test 1: Request Deduplication
async function testDedup() {
  console.log('=== Testing Request Deduplication ===');
  const { apiClient } = await import('/src/lib/apiClient.ts');

  const url = '/api/projections?week=2025-11&sport=nfl';
  const startTime = Date.now();

  console.log('Triggering two identical requests...');
  const p1 = apiClient.fetch(url);
  const p2 = apiClient.fetch(url);

  console.log('Promise 1:', p1);
  console.log('Promise 2:', p2);
  console.log('Same promise?', p1 === p2);

  try {
    const [r1, r2] = await Promise.all([p1, p2]);
    const endTime = Date.now();

    console.log('✓ Both requests completed');
    console.log('Same response object?', r1 === r2);
    console.log('Response 1 status:', r1.status);
    console.log('Response 2 status:', r2.status);
    console.log(`Total time: ${endTime - startTime}ms`);
    console.log('Check Network tab - should see only 1 request');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Test 2: Abort Cleanup
async function testAbort() {
  console.log('=== Testing Abort Cleanup ===');
  const { apiClient } = await import('/src/lib/apiClient.ts');

  const url = '/api/projections?week=2025-11&sport=nfl';

  console.log('Starting request...');
  const requestPromise = apiClient.fetch(url);

  // Abort after 100ms
  setTimeout(() => {
    console.log('Aborting request...');
    apiClient.abort(url);
  }, 100);

  try {
    await requestPromise;
    console.error('✗ Request completed (should have been aborted)');
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('✓ Request aborted successfully');
      console.log('Check Network tab - request should show "cancelled" status');
    } else {
      console.error('Unexpected error:', err);
    }
  }
}

// Export for console use
window.testDedup = testDedup;
window.testAbort = testAbort;

console.log('API Client tests loaded!');
console.log('Run: testDedup() - Test request deduplication');
console.log('Run: testAbort() - Test abort cleanup');
