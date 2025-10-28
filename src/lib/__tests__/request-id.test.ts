import { describe, it, expect } from 'vitest';
import { extractRequestId, extractRequestIdFromResponse } from '../request-id';

describe('extractRequestId', () => {
  const mockResponse = (headers: Record<string, string>) =>
    ({
      headers: {
        get: (key: string) => headers[key] || null,
      },
    }) as Response;

  it('should return body.request_id when available', () => {
    const response = mockResponse({ 'x-request-id': 'header-id' });
    const body = { request_id: 'body-id' };

    const result = extractRequestId(response, body);

    expect(result).toBe('body-id');
  });

  it('should fall back to x-request-id header when body.request_id is missing', () => {
    const response = mockResponse({ 'x-request-id': 'header-id' });
    const body = { other_field: 'value' };

    const result = extractRequestId(response, body);

    expect(result).toBe('header-id');
  });

  it('should fall back to x-request-id header when body.request_id is empty', () => {
    const response = mockResponse({ 'x-request-id': 'header-id' });
    const body = { request_id: '' };

    const result = extractRequestId(response, body);

    expect(result).toBe('header-id');
  });

  it('should return fallback when both body and header are missing', () => {
    const response = mockResponse({});
    const body = {};

    const result = extractRequestId(response, body, 'no-request-id');

    expect(result).toBe('no-request-id');
  });

  it('should return fallback when both body and header are empty', () => {
    const response = mockResponse({ 'x-request-id': '' });
    const body = { request_id: '' };

    const result = extractRequestId(response, body, 'unavailable');

    expect(result).toBe('unavailable');
  });

  it('should handle null body gracefully', () => {
    const response = mockResponse({ 'x-request-id': 'header-id' });

    const result = extractRequestId(response, null);

    expect(result).toBe('header-id');
  });

  it('should handle undefined body gracefully', () => {
    const response = mockResponse({ 'x-request-id': 'header-id' });

    const result = extractRequestId(response, undefined);

    expect(result).toBe('header-id');
  });
});

describe('extractRequestIdFromResponse', () => {
  it('should extract from JSON response body', async () => {
    const response = {
      headers: {
        get: (key: string) => (key === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ request_id: 'body-id' }),
    } as unknown as Response;

    const result = await extractRequestIdFromResponse(response);

    expect(result).toBe('body-id');
  });

  it('should fall back to header when JSON parsing fails', async () => {
    const response = {
      headers: {
        get: (key: string) => (key === 'content-type' ? 'application/json' : 'header-id'),
      },
      json: async () => {
        throw new Error('Parse error');
      },
    } as unknown as Response;

    const result = await extractRequestIdFromResponse(response);

    expect(result).toBe('header-id');
  });

  it('should fall back to header when content-type is not JSON', async () => {
    const response = {
      headers: {
        get: (key: string) => (key === 'content-type' ? 'text/plain' : 'header-id'),
      },
      json: async () => ({ request_id: 'body-id' }),
    } as unknown as Response;

    const result = await extractRequestIdFromResponse(response);

    expect(result).toBe('header-id');
  });
});
