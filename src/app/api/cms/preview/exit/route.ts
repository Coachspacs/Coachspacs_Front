import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'ar';

  const draft = await draftMode();
  draft.disable();

  const redirectUrl = new URL(`/${locale}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
