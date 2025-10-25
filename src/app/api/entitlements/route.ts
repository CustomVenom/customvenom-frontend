import { NextResponse } from 'next/server';

import { getEntitlements } from '@/lib/entitlements';

export async function GET() {
  try {
    const entitlements = await getEntitlements();
    return NextResponse.json(entitlements);
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entitlements' },
      { status: 500 }
    );
  }
}

