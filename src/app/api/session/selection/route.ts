import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_BASE']!;

function getCorsHeaders(): Headers {
  const headers = new Headers();
  const origin = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET(request: NextRequest) {
  const url = `${API_BASE}/api/session/selection`;
  const init: RequestInit = {
    method: 'GET',
    headers: { 'content-type': 'application/json', cookie: request.headers.get('cookie') || '' },
    credentials: 'include',
  };
  const r = await fetch(url, init);
  const body = await r.text();
  const headers = getCorsHeaders();
  headers.set('content-type', r.headers.get('content-type') || 'application/json; charset=utf-8');
  return new NextResponse(body, {
    status: r.status,
    headers,
  });
}

export async function POST(request: NextRequest) {
  const url = `${API_BASE}/api/session/selection`;
  const body = await request.text();
  const init: RequestInit = {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: request.headers.get('cookie') || '' },
    credentials: 'include',
    body,
  };
  const r = await fetch(url, init);
  const responseBody = await r.text();
  const headers = getCorsHeaders();
  headers.set('content-type', r.headers.get('content-type') || 'application/json; charset=utf-8');
  return new NextResponse(responseBody, {
    status: r.status,
    headers,
  });
}
