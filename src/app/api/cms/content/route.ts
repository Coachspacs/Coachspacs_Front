import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { CmsServerService } from '@/services/cms/cmsServerService';

export async function GET() {
  try {
    const [branding, landingDoc] = await Promise.all([
      CmsServerService.getPublishedBranding(),
      CmsServerService.getLandingPageDoc(),
    ]);

    return NextResponse.json({
      success: true,
      branding,
      landing: landingDoc,
    });
  } catch (error: any) {
    console.error('[CmsContentAPI] Error fetching CMS content:', error);
    return NextResponse.json({ error: 'Failed to fetch CMS content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Basic Admin Role Guard via cookie or header
    const userRole = decodeURIComponent(req.cookies.get('user_role')?.value || '').toLowerCase();
    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken || (userRole !== 'admin' && userRole !== 'staff')) {
      // In local dev without active cookies, allow if development environment or header
      const devBypass = process.env.NODE_ENV === 'development';
      if (!devBypass) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin privileges required to edit CMS content' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { action, data, userEmail = 'admin@coachspace.com' } = body;

    if (action === 'save_draft') {
      const updatedDoc = await CmsServerService.saveLandingDraft(data, userEmail);
      return NextResponse.json({
        success: true,
        message: 'Draft saved successfully',
        landing: updatedDoc,
      });
    }

    if (action === 'publish') {
      const publishedDoc = await CmsServerService.publishLandingPage(userEmail);
      // Trigger instant ISR revalidation
      revalidatePath('/ar');
      revalidatePath('/en');
      revalidatePath('/[locale]', 'layout');

      return NextResponse.json({
        success: true,
        message: 'Landing page published successfully',
        landing: publishedDoc,
      });
    }

    if (action === 'save_branding') {
      const updatedBranding = await CmsServerService.saveBranding(data, userEmail);
      // Trigger instant revalidation for layout styles
      revalidatePath('/ar');
      revalidatePath('/en');
      revalidatePath('/[locale]', 'layout');

      return NextResponse.json({
        success: true,
        message: 'Branding settings updated and revalidated',
        branding: updatedBranding,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('[CmsContentAPI] Error processing CMS mutation:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
