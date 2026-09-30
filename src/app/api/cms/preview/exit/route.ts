import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'ar';

  try {
    const draft = await draftMode();
    draft.disable();
  } catch (e) {
    console.warn('[Preview Exit] Error calling draft.disable():', e);
  }

  const redirectUrl = new URL(`/${locale}`, request.url);
  const response = NextResponse.redirect(redirectUrl);

  // Explicitly expire and delete Next.js draft mode cookies across all paths
  response.cookies.delete('__prerender_bypass');
  response.cookies.delete('__next_preview_data');
  response.cookies.set('__prerender_bypass', '', { maxAge: 0, path: '/', expires: new Date(0) });
  response.cookies.set('__next_preview_data', '', { maxAge: 0, path: '/', expires: new Date(0) });

  return response;
}
