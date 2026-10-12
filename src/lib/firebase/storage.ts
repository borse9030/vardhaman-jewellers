import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  compressImage,
  compressImageToDataUrl,
  ImageCompressionOptions,
} from '@/lib/utils/imageCompressor';

export { compressImage, compressImageToDataUrl };

/**
 * Uploads an image file to Firebase Storage under the specified directory (e.g. 'products')
 * Automatically downsizes and compresses heavy photos to ultra-lightweight WebP/JPEG (80-150KB)
 * to save storage space and speed up customer loading.
 * 
 * Returns the permanent public download URL.
 * Falls back to local/server upload if Firebase Storage fails or is unavailable.
 */
export async function uploadImageToFirebaseStorage(
  file: File | Blob,
  folder: string = 'products',
  customFileName?: string,
  options?: ImageCompressionOptions
): Promise<string> {
  // 1. Automatically compress and optimize image before uploading
  let fileToUpload: File;
  try {
    fileToUpload = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.82,
      format: 'image/webp',
      ...options,
    });
  } catch (compErr) {
    console.warn('Image compression bypassed:', compErr);
    if (file instanceof File) {
      fileToUpload = file;
    } else {
      fileToUpload = new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
    }
  }

  const originalName = fileToUpload.name;
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = cleanName.substring(cleanName.lastIndexOf('.')) || '.webp';
  const baseName = cleanName.substring(0, cleanName.lastIndexOf('.')) || 'img';
  const fileName =
    customFileName ||
    `${baseName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
  const filePath = `${folder}/${fileName}`;

  // 2. Try Firebase Storage directly
  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, fileToUpload, {
        contentType: fileToUpload.type || 'image/webp',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`[Firebase Storage] Uploaded optimized image (${fileToUpload.size} bytes): ${downloadUrl}`);
      return downloadUrl;
    } catch (storageErr: any) {
      console.warn(
        '[Firebase Storage] Direct upload failed, falling back to server upload:',
        storageErr?.message || storageErr
      );
    }
  }

  // 3. Fallback to /api/upload
  const formData = new FormData();
  formData.append('file', fileToUpload, fileName);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload image to server');
  }

  const data = await res.json();
  if (data.url) {
    return data.url;
  }

  throw new Error('Upload succeeded but no URL returned');
}

/**
 * Upload multiple files in parallel to Firebase Storage
 */
export async function uploadMultipleImagesToFirebaseStorage(
  files: (File | Blob)[],
  folder: string = 'products',
  options?: ImageCompressionOptions
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImageToFirebaseStorage(file, folder, undefined, options)
  );
  return await Promise.all(uploadPromises);
}
