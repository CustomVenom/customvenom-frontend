import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Stub endpoint for future server persistence
  // For now, just return success - persistence happens client-side
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    },
  );
}
