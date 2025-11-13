// Proxy to Workers API admin usage endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdminEmail } from '@/lib/rbac';

const API_BASE =
  process.env['NEXT_PUBLIC_API_BASE'] || process.env['API_BASE_STAGING'] || 'https://api.customvenom.com';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get JWT token from session (if available) or use API key
    const token = (session as { accessToken?: string })?.accessToken;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = new URL(request.url);
    const path = url.pathname.replace('/api/admin', '');
    const apiUrl = `${API_BASE}/api/admin${path}${url.search}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
