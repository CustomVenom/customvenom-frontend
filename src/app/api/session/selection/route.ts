import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_BASE']!;

export async function GET(request: NextRequest) {
  const url = `${API_BASE}/session/selection`;
  const init: RequestInit = {
    method: 'GET',
    headers: { 'content-type': 'application/json', cookie: request.headers.get('cookie') || '' },
    credentials: 'include',
  };
  const r = await fetch(url, init);
  const body = await r.text();
  // Echo CORS-related cookies through Next automatically; just forward status/body and JSON type
  return new NextResponse(body, {
    status: r.status,
    headers: {
      'content-type': r.headers.get('content-type') || 'application/json; charset=utf-8',
    },
  });
}

export async function POST(request: NextRequest) {
  const url = `${API_BASE}/session/selection`;
  const body = await request.text();
  const init: RequestInit = {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: request.headers.get('cookie') || '' },
    credentials: 'include',
    body,
  };
  const r = await fetch(url, init);
  const responseBody = await r.text();
  // Echo CORS-related cookies through Next automatically; just forward status/body and JSON type
  return new NextResponse(responseBody, {
    status: r.status,
    headers: {
      'content-type': r.headers.get('content-type') || 'application/json; charset=utf-8',
    },
  });
}
