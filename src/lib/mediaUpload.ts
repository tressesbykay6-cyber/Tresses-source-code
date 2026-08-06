export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 45 * 1024 * 1024;
const RATE_LIMIT_KEY = 'tresses-admin-upload-attempts';
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_UPLOADS_PER_WINDOW = 3;

export interface PreparedUpload {
  id: string;
  file: File;
  previewUrl: string;
  optimized: boolean;
  requiresServerTranscode: boolean;
}

const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
const allowedVideos = ['video/mp4', 'video/webm'];

function generateId() {
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function allowUploadAttempt() {
  const now = Date.now();
  const previous = JSON.parse(sessionStorage.getItem(RATE_LIMIT_KEY) || '[]') as number[];
  const current = previous.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (current.length >= MAX_UPLOADS_PER_WINDOW) {
    throw new Error('Upload limit reached. Please wait one minute before trying again.');
  }
  current.push(now);
  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(current));
}

async function imageToWebp(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('This image could not be prepared.'));
      element.src = objectUrl;
    });
    const longestSide = 1600;
    const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preparation is not supported by this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!blob) throw new Error('Image optimization did not complete.');
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function prepareUpload(file: File): Promise<PreparedUpload> {
  if (allowedImages.includes(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 10 MB or smaller before preparation.');
    const optimizedFile = await imageToWebp(file);
    return { id: generateId(), file: optimizedFile, previewUrl: URL.createObjectURL(optimizedFile), optimized: true, requiresServerTranscode: false };
  }
  if (allowedVideos.includes(file.type)) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error('Videos must be 45 MB or smaller. Trim it on your phone before upload.');
    return { id: generateId(), file, previewUrl: URL.createObjectURL(file), optimized: false, requiresServerTranscode: true };
  }
  throw new Error('Use JPG, PNG, WebP, MP4, or WebM files only.');
}

function openUploadCache() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('tresses-admin-upload-cache', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('uploads', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open upload cache.'));
  });
}

export async function cacheUpload(upload: PreparedUpload) {
  const database = await openUploadCache();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('uploads', 'readwrite');
    transaction.objectStore('uploads').put({ id: upload.id, file: upload.file, createdAt: Date.now() });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Unable to cache upload.'));
  });
  database.close();
}

