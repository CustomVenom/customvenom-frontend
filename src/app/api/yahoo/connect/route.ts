export const dynamic = 'force-static';
export async function GET() {
  return new Response('Gone', { status: 410 });
}

