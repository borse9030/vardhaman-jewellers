import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage under the specified directory (e.g. 'products')
 * Returns the permanent public download URL.
 * Falls back to local/server upload if Firebase Storage fails or is unavailable.
 */
export async function uploadImageToFirebaseStorage(
  file: File | Blob,
  folder: string = 'products',
  customFileName?: string
): Promise<string> {
  const originalName = file instanceof File ? file.name : 'image.jpg';
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = cleanName.substring(cleanName.lastIndexOf('.')) || '.jpg';
  const baseName = cleanName.substring(0, cleanName.lastIndexOf('.')) || 'img';
  const fileName = customFileName || `${baseName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
  const filePath = `${folder}/${fileName}`;

  // 1. Try Firebase Storage directly
  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`[Firebase Storage] Uploaded successfully: ${downloadUrl}`);
      return downloadUrl;
    } catch (storageErr: any) {
      console.warn('[Firebase Storage] Direct upload failed, falling back to server upload:', storageErr?.message || storageErr);
    }
  }

  // 2. Fallback to /api/upload
  const formData = new FormData();
  formData.append('file', file, fileName);

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
  folder: string = 'products'
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImageToFirebaseStorage(file, folder));
  return await Promise.all(uploadPromises);
}
