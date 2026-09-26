import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'coachspace/cms';
    const customPublicId = formData.get('public_id') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file was provided for upload.' },
        { status: 400 }
      );
    }

    // Check mime type (allow standard image formats)
    const fileType = file.type || '';
    const fileName = file.name || '';
    const isSvgOrIco = fileName.endsWith('.svg') || fileName.endsWith('.ico');

    if (!ALLOWED_IMAGE_TYPES.includes(fileType) && !isSvgOrIco) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${fileType || 'unknown'}. Please upload PNG, JPG, WebP, SVG, GIF, or ICO.`,
        },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Max file size 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit (10MB).' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(buffer, {
      folder,
      publicId: customPublicId,
      resourceType: 'auto',
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Cloudinary CMS upload error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload image to Cloudinary.' },
      { status: 500 }
    );
  }
}
