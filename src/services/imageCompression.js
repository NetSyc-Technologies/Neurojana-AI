/**
 * Client-side Image Processing & Base64 Compression for Cloud Firestore
 * Enforces security, strips metadata/EXIF, and constrains payload sizes.
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TARGET_MAX_WIDTH = 1200;
const TARGET_MAX_HEIGHT = 1200;
const TARGET_MAX_BYTES = 750 * 1024; // 750 KiB binary (~1000 KiB Base64)

/**
 * Compresses and converts an image file into a compact Base64 string for Firestore.
 * @param {File} file
 * @param {object} options
 * @param {number} [options.maxWidth=1200]
 * @param {number} [options.maxHeight=1200]
 * @param {number} [options.quality=0.82]
 * @returns {Promise<{ dataBase64: string, mimeType: string, byteSize: number, width: number, height: number, fileName: string }>}
 */
export async function compressImageToBase64(file, options = {}) {
  const {
    maxWidth = TARGET_MAX_WIDTH,
    maxHeight = TARGET_MAX_HEIGHT,
    quality = 0.82,
  } = options;

  if (!file || !(file instanceof File)) {
    throw new Error('Please select a valid image file.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image format (${file.type}). Please upload a JPEG, PNG, or WebP image.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Unable to create canvas context for image processing.'));
        }

        // Draw and strip EXIF
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, fallback to JPEG
        let mimeType = 'image/webp';
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // If browser falls back to image/png for unsupported webp, use jpeg
        if (!dataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Calculate approximate binary size
        const base64Data = dataUrl.split(',')[1] || '';
        const byteSize = Math.round((base64Data.length * 3) / 4);

        if (byteSize > TARGET_MAX_BYTES) {
          return reject(
            new Error(
              `Compressed image is ${Math.round(byteSize / 1024)} KiB, which exceeds the ${Math.round(
                TARGET_MAX_BYTES / 1024
              )} KiB safe limit for Cloud Firestore. Please choose a smaller image.`
            )
          );
        }

        resolve({
          dataBase64: dataUrl,
          mimeType,
          byteSize,
          width,
          height,
          fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
