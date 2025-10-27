import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE not configured' }, { status: 500 });
  }

  // Redirect to the Workers API OAuth launch endpoint
  return NextResponse.redirect(`${apiBase}/oauth/yahoo/launch`);
}
