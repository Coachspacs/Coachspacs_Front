import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary server-side instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mrytwejm',
  api_key: process.env.CLOUDINARY_API_KEY || '232972192826963',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ovsCupnfy85k3Vw_xlUWl6zmtDg',
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: Record<string, unknown>[];
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
}

/**
 * Uploads a buffer directly to Cloudinary with automatic optimization.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> {
  const {
    folder = 'coachspace/cms',
    publicId,
    tags = ['coachspace', 'cms'],
    transformation,
    resourceType = 'auto',
  } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        tags,
        transformation,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload to Cloudinary returned an empty response.'));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}
