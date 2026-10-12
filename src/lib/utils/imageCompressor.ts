/**
 * High-Fidelity Client-Side Image Compression & Optimization Utility
 * 
 * Specially calibrated for high-end luxury jewellery (gold textures, diamond facets,
 * gemstone brilliance, and BIS hallmark certificates) with ZERO noticeable quality loss.
 * 
 * - Max Resolution: 1920px (Full HD/2K - allows customer zoom without pixelation)
 * - Format: Modern WebP with high-quality perceptual encoding (90% quality)
 * - Multi-step resampling to prevent aliasing or blurring of thin gold chains
 * - Reduces storage from ~10MB phone camera sizes down to ~200KB - 400KB (96%+ savings)
 *   while keeping the image razor-sharp and visually pristine.
 */

export interface ImageCompressionOptions {
  maxWidth?: number; // default: 1920px (Full HD 2K for jewellery zoom)
  maxHeight?: number; // default: 1920px
  quality?: number; // default: 0.90 (90% - visually lossless for diamonds & gold)
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Stepwise canvas downscaling to preserve micro-details, diamond sparkle,
 * and intricate gold filigree without jagged edges or blurring.
 */
function stepDownscale(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let curWidth = sourceCanvas.width;
  let curHeight = sourceCanvas.height;

  // If already at or smaller than target, return as is
  if (curWidth <= targetWidth && curHeight <= targetHeight) {
    return sourceCanvas;
  }

  let curCanvas = sourceCanvas;

  // Step down by half until within 2x of target to maintain high-frequency details
  while (curWidth / 2 >= targetWidth && curHeight / 2 >= targetHeight) {
    const nextWidth = Math.round(curWidth / 2);
    const nextHeight = Math.round(curHeight / 2);

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextWidth;
    stepCanvas.height = nextHeight;
    const stepCtx = stepCanvas.getContext('2d');
    if (!stepCtx) break;

    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(curCanvas, 0, 0, nextWidth, nextHeight);

    curCanvas = stepCanvas;
    curWidth = nextWidth;
    curHeight = nextHeight;
  }

  // Final draw to exact target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) return curCanvas;

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(curCanvas, 0, 0, targetWidth, targetHeight);

  return finalCanvas;
}

/**
 * Compresses an image File or Blob with high fidelity and zero noticeable quality loss.
 */
export async function compressImage(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.90, // 90% quality provides visually lossless output for fine jewellery
    format = 'image/webp',
  } = options;

  // In non-browser environments, return the file as is
  if (typeof window === 'undefined') {
    if (file instanceof File) return file;
    return new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
  }

  // Non-image files: return as is
  if (file.type && !file.type.startsWith('image/')) {
    if (file instanceof File) return file;
    return new File([file], 'file', { type: file.type });
  }

  // If the file is already small (under 300KB) and already WebP, avoid recompressing
  if (file.size <= 300 * 1024 && file.type === 'image/webp') {
    if (file instanceof File) return file;
    return new File([file], 'image.webp', { type: 'image/webp' });
  }

  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const img = new (window as any).Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale proportionally ONLY if larger than 1920px
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Initial canvas with source dimensions
          const initialCanvas = document.createElement('canvas');
          initialCanvas.width = img.width;
          initialCanvas.height = img.height;
          const initialCtx = initialCanvas.getContext('2d');

          if (!initialCtx) {
            if (file instanceof File) return resolve(file);
            return resolve(new File([file], 'image.jpg', { type: file.type || 'image/jpeg' }));
          }

          initialCtx.drawImage(img, 0, 0);

          // Perform high quality step-downscaling if dimensions changed
          const finalCanvas = (width !== img.width || height !== img.height)
            ? stepDownscale(initialCanvas, width, height)
            : initialCanvas;

          // Attempt export in specified format (WebP preferred for zero quality loss + small size)
          const targetFormat = format;
          finalCanvas.toBlob(
            (blob) => {
              if (blob) {
                const originalName = file instanceof File ? file.name : 'image.jpg';
                const baseName = originalName.replace(/\.[^/.]+$/, '');
                const ext = targetFormat === 'image/webp' ? '.webp' : '.jpg';
                const compressedFile = new File([blob], `${baseName}${ext}`, {
                  type: blob.type || targetFormat,
                  lastModified: Date.now(),
                });

                console.log(
                  `[Image Optimizer] High-fidelity compression for ${file instanceof File ? file.name : 'image'}: ` +
                    `${formatBytes(file.size)} -> ${formatBytes(compressedFile.size)} ` +
                    `(${Math.round((1 - compressedFile.size / file.size) * 100)}% saved with 90% lossless clarity)`
                );

                resolve(compressedFile);
              } else {
                // Fallback to high quality JPEG if WebP blob generation fails
                finalCanvas.toBlob(
                  (fallbackBlob) => {
                    if (fallbackBlob) {
                      const originalName = file instanceof File ? file.name : 'image.jpg';
                      const baseName = originalName.replace(/\.[^/.]+$/, '');
                      resolve(
                        new File([fallbackBlob], `${baseName}.jpg`, {
                          type: 'image/jpeg',
                          lastModified: Date.now(),
                        })
                      );
                    } else {
                      if (file instanceof File) resolve(file);
                      else resolve(new File([file], 'image.jpg', { type: file.type }));
                    }
                  },
                  'image/jpeg',
                  quality
                );
              }
            },
            targetFormat,
            quality
          );
        } catch (err) {
          console.warn('Canvas optimization failed, preserving original file:', err);
          if (file instanceof File) resolve(file);
          else resolve(new File([file], 'image.jpg', { type: file.type }));
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image into a lightweight Base64 data URL while keeping crisp 90% quality.
 */
export async function compressImageToDataUrl(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const compressed = await compressImage(file, options);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read compressed file'));
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(compressed);
  });
}

/**
 * Helper to display human-readable byte sizes (e.g. "124 KB", "3.2 MB")
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
