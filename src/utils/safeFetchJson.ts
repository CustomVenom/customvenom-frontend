import 'server-only';

export async function safeFetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    // Add timeout to prevent hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      credentials: 'include',
      ...init,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}
