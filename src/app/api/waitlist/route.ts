import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/ratelimit';

// Simple in-memory store for MVP (replace with DB later)
const waitlist = new Set<string>();

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

    // Check for duplicate (silent success)
    if (waitlist.has(email.toLowerCase())) {
      return NextResponse.json({ success: true });
    }

    // Add to waitlist
    waitlist.add(email.toLowerCase());

    // Log the signup (for now, just console)
    console.log('[Waitlist]', {
      email,
      name,
      platform,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to actual database or email service

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Waitlist Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
