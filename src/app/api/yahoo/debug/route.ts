import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    host: req.headers.get('host'),
    y_state: req.cookies.get('y_state')?.value ?? null,
  });
}
