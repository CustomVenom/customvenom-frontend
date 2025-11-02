// Simple in-memory rate limiting for MVP
// Upgrade to Upstash Redis for production scale

const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

export async function checkRateLimit(ip: string): Promise<{ success: boolean }> {
  const now = Date.now();
  const key = `ratelimit:${ip}`;
  const limit = rateLimitMap.get(key);

  // Reset if expired (1 hour window)
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return { success: true };
  }

  // Check if limit exceeded (5 per hour)
  if (limit.count >= 5) {
    return { success: false };
  }

  // Increment count
  limit.count++;
  return { success: true };
}

