import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { enforceYahooHttps, safeFetch } from './http-guard';

describe('enforceYahooHttps', () => {
  it('forces https for Yahoo fantasy', () => {
    expect(enforceYahooHttps('http://fantasysports.yahoo.com/x')).toBe(
      'https://fantasysports.yahoo.com/x',
    );
  });

  it('forces https for api.yahoo.com', () => {
    expect(enforceYahooHttps('http://api.yahoo.com/y')).toBe('https://api.yahoo.com/y');
  });

  it('forces https for login.yahoo.com', () => {
    expect(enforceYahooHttps('http://login.yahoo.com/oauth')).toBe('https://login.yahoo.com/oauth');
  });

  it('leaves non-Yahoo URLs unchanged', () => {
    expect(enforceYahooHttps('http://example.com')).toBe('http://example.com/');
    expect(enforceYahooHttps('http://api.github.com')).toBe('http://api.github.com/');
  });

  it('leaves relative paths unchanged', () => {
    expect(enforceYahooHttps('./relative/path')).toBe('./relative/path');
    expect(enforceYahooHttps('/relative')).toBe('/relative');
    expect(enforceYahooHttps('relative')).toBe('relative');
  });

  it('leaves already-https Yahoo URLs unchanged', () => {
    expect(enforceYahooHttps('https://fantasysports.yahoo.com/x')).toBe(
      'https://fantasysports.yahoo.com/x',
    );
    expect(enforceYahooHttps('https://api.yahoo.com/y')).toBe('https://api.yahoo.com/y');
  });

  it('handles edge cases gracefully', () => {
    expect(enforceYahooHttps('')).toBe('');
    expect(enforceYahooHttps('not-a-url')).toBe('not-a-url');
    expect(enforceYahooHttps('ftp://yahoo.com')).toBe('ftp://yahoo.com/');
  });
});

describe('safeFetch', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('{}'));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('calls fetch with upgraded Yahoo URL', async () => {
    await safeFetch('http://fantasysports.yahoo.com/api', { method: 'GET' });

    expect(globalThis.fetch).toHaveBeenCalledWith('https://fantasysports.yahoo.com/api', {
      method: 'GET',
    });
  });

  it('calls fetch with non-Yahoo URL unchanged', async () => {
    await safeFetch('http://api.github.com/users', { method: 'GET' });

    expect(globalThis.fetch).toHaveBeenCalledWith('http://api.github.com/users', { method: 'GET' });
  });

  it('calls fetch with relative URL unchanged', async () => {
    await safeFetch('/api/leagues', { method: 'GET' });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/leagues', { method: 'GET' });
  });

  it('handles URL objects', async () => {
    const url = new URL('http://fantasysports.yahoo.com/api');
    await safeFetch(url, { method: 'GET' });

    expect(globalThis.fetch).toHaveBeenCalledWith('https://fantasysports.yahoo.com/api', {
      method: 'GET',
    });
  });
});
