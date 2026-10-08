import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'vardhaman-jewellery-media';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-demo.r2.dev';

export function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Generate a pre-signed URL for direct browser-to-R2 upload
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<{ uploadUrl: string; publicUrl: string } | null> {
  const client = getR2Client();
  if (!client) {
    // Graceful fallback for local development without active R2 credentials
    return {
      uploadUrl: `/api/upload/mock?key=${encodeURIComponent(key)}`,
      publicUrl: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

  return { uploadUrl, publicUrl };
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteR2Object(key: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return true;

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Failed to delete object from R2:', error);
    return false;
  }
}

/**
 * Generate standard R2 storage key paths for products
 */
export function getProductR2Key(productId: string, variant: 'main' | 'thumbnail' | `gallery-${number}`): string {
  const sanitizedId = productId.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  return `products/${sanitizedId}/${variant}.webp`;
}
