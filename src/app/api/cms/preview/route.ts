import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const locale = searchParams.get('locale') || 'ar';
  const expectedSecret = process.env.CMS_PREVIEW_SECRET || 'coachspace_cms_preview_secret';

  if (secret !== expectedSecret) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const redirectUrl = new URL(`/${locale}?preview=true`, request.url);
  return NextResponse.redirect(redirectUrl);
}
