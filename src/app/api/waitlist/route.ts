import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/ratelimit';

// Simple in-memory store for MVP (replace with DB later)
const waitlist = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const ipAddress = typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1';

    const rateLimitResult = await checkRateLimit(ipAddress);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, name, platform } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 },
      );
    }

    // Check for duplicate (silent success)
    const emailLower = email.toLowerCase().trim();
    if (waitlist.has(emailLower)) {
      return NextResponse.json({ success: true });
    }

    // Add to waitlist
    waitlist.add(emailLower);

    // Log the signup (for now, just console)
    console.log('[Waitlist]', {
      email: emailLower,
      name: name || 'N/A',
      platform: platform || 'N/A',
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to actual database or email service

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Waitlist Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

