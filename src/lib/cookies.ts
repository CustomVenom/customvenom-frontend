// Small helper for cookies (Node Next.js API routes)
export function setCookie(
  res: { headers: { set: (name: string, value: string) => void } },
  name: string,
  value: string,
  opts: Partial<{
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Lax' | 'Strict' | 'None';
    path: string;
    maxAge: number;
  }> = {}
) {
  const o = { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', ...opts };
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${o.path}`,
    `SameSite=${o.sameSite}`,
    `HttpOnly`,
  ];
  if (o.secure) parts.push(`Secure`);
  if (o.maxAge) parts.push(`Max-Age=${o.maxAge}`);
  res.headers.set('Set-Cookie', parts.join('; '));
}

export function clearCookie(
  res: { headers: { set: (name: string, value: string) => void } },
  name: string
) {
  res.headers.set('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}
