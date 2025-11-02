import { NextRequest, NextResponse } from 'next/server';

import { kv } from '@vercel/kv';

export async function GET(_request: NextRequest) {
  try {
    // Get all emails from the set
    const emails = (await kv.smembers('waitlist:emails')) as string[];

    if (!emails || emails.length === 0) {
      return NextResponse.json({ count: 0, signups: [] });
    }

    // Fetch details for each email
    const signups = await Promise.all(
      emails.map(async (email) => {
        const details = await kv.hgetall(`waitlist:${email}`);
        return details;
      }),
    );

    return NextResponse.json({
      count: signups.length,
      signups: signups.filter(Boolean), // Remove any null entries
    });
  } catch (error) {
    console.error('[Waitlist Export Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

