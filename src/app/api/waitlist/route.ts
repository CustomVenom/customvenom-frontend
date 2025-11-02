import { NextRequest, NextResponse } from 'next/server';

import { kv } from '@vercel/kv';

import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded?.split(',')[0] ?? '127.0.0.1').trim();

    const { success } = await checkRateLimit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, name, platform } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check for duplicate (silent success)
    const exists = await kv.sismember('waitlist:emails', emailLower);
    if (exists) {
      return NextResponse.json({ success: true });
    }

    // Store in KV
    // 1. Add email to set (for quick duplicate checks)
    await kv.sadd('waitlist:emails', emailLower);

    // 2. Store full details in hash (for retrieval)
    await kv.hset(`waitlist:${emailLower}`, {
      email,
      name: name || '',
      platform: platform || '',
      timestamp: new Date().toISOString(),
    });

    console.log('[Waitlist] New signup:', { email, name, platform });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Waitlist Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
