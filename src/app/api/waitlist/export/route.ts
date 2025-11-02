import { NextRequest, NextResponse } from 'next/server';

import { createClient } from 'redis';

export async function GET(_request: NextRequest) {
  try {
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) {
      return NextResponse.json({ error: 'Redis configuration missing' }, { status: 500 });
    }

    const redis = createClient({ url: redisUrl });
    await redis.connect();

    try {
      const emails = await redis.sMembers('waitlist:emails');

      if (!emails || emails.length === 0) {
        await redis.quit();
        return NextResponse.json({ count: 0, signups: [] });
      }

      const signups = await Promise.all(
        emails.map(async (email) => await redis.hGetAll(`waitlist:${email}`)),
      );

      await redis.quit();

      return NextResponse.json({
        count: signups.length,
        signups: signups.filter((s) => s && Object.keys(s).length > 0),
      });
    } catch (redisError) {
      await redis.quit();
      throw redisError;
    }
  } catch (error) {
    console.error('[Waitlist Export Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
