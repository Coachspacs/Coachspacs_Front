import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = req.nextUrl.searchParams.get('secret') || (await req.json().catch(() => ({})))?.secret;
    const expectedSecret = process.env.CMS_REVALIDATE_SECRET || 'coachspace_cms_secret_key';

    // Simple security guard: either secret matches or valid internal call
    if (secret && secret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized revalidation request' }, { status: 401 });
    }

    // Revalidate public landing pages across locales
    revalidatePath('/ar');
    revalidatePath('/en');
    revalidatePath('/[locale]', 'layout');

    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: ['/ar', '/en'],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[RevalidateAPI] Failed to revalidate:', error);
    return NextResponse.json({ error: 'Failed to revalidate cache' }, { status: 500 });
  }
}
