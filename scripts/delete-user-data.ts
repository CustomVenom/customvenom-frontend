#!/usr/bin/env ts-node

// Usage: ts-node scripts/delete-user-data.ts <userId> [--dry-run]

const userId = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!userId) {
  console.error('Usage: ts-node scripts/delete-user-data.ts <userId> [--dry-run]');
  process.exit(1);
}

(async () => {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787';
  const res = await fetch(
    `${base}/api/admin/users/${encodeURIComponent(userId)}?dryRun=${dryRun ? '1' : '0'}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
    },
  );
  const json = await res.json();
  if (!res.ok) {
    console.error('Delete failed:', res.status, json);
    process.exit(2);
  }
  console.log(JSON.stringify(json, null, 2));
})();
