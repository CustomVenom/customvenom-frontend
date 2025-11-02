import { NextRequest, NextResponse } from 'next/server';

import { createClient } from 'redis';

import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
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

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Connect to Redis
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
      // Check for duplicate
      const exists = await redis.sIsMember('waitlist:emails', emailLower);
      if (exists) {
        await redis.quit();
        return NextResponse.json({ success: true });
      }

      // Store in Redis
      await redis.sAdd('waitlist:emails', emailLower);
      await redis.hSet(`waitlist:${emailLower}`, {
        email,
        name: name || '',
        platform: platform || '',
        timestamp: new Date().toISOString(),
      });

      console.log('[Waitlist] New signup:', { email, name, platform });
      await redis.quit();

      return NextResponse.json({ success: true });
    } catch (redisError) {
      await redis.quit();
      throw redisError;
    }
  } catch (error) {
    console.error('[Waitlist Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
