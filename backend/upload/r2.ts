/**
 * Luvio Platform — R2 Storage Utility
 * Centralised helpers for uploading, deleting, and serving files from
 * the `luvio-uploads` Cloudflare R2 bucket.
 *
 * Folder structure:
 *   avatars/{userId}.{ext}              — user profile pictures
 *   jobs/{jobId}/{index}.{ext}          — job post images (up to 5)
 *   listings/{listingId}/{index}.{ext}  — marketplace listing images (up to 5)
 *   chat/{threadId}/{fileId}.{ext}      — chat media attachments
 */

// ============================================
// Types
// ============================================

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// MIME type helpers
// ============================================

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

export function mimeToExt(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? 'bin';
}

// ============================================
// URL builder
// ============================================

/**
 * Build the public serving URL for an R2 object key.
 * Files are served via the Worker itself at /api/v1/uploads/:key
 */
export function getFileUrl(baseUrl: string, key: string): string {
  // baseUrl: e.g. "https://api.luvio.it" or the worker URL
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${baseUrl}/api/v1/uploads/${encodedKey}`;
}

// ============================================
// Validation
// ============================================

export interface ValidationOptions {
  maxSizeMb: number;
  allowedTypes: string[];
}

export function validateFile(
  file: File,
  options: ValidationOptions
): ValidationError | null {
  const { maxSizeMb, allowedTypes } = options;

  if (!allowedTypes.includes(file.type)) {
    return {
      field: 'file',
      message: `File type "${file.type}" is not allowed. Accepted: ${allowedTypes.join(', ')}`,
    };
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      field: 'file',
      message: `File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the ${maxSizeMb} MB limit`,
    };
  }

  return null;
}

// Preset validation configs
export const AVATAR_RULES: ValidationOptions = {
  maxSizeMb: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

export const IMAGE_RULES: ValidationOptions = {
  maxSizeMb: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

export const CHAT_MEDIA_RULES: ValidationOptions = {
  maxSizeMb: 25,
  allowedTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf', 'video/mp4', 'video/quicktime',
  ],
};

// ============================================
// Core R2 operations
// ============================================

/**
 * Upload a File object to R2.
 * Returns the key and resolved serving URL.
 */
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  file: File,
  workerBaseUrl: string
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  return {
    key,
    url: getFileUrl(workerBaseUrl, key),
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Upload a batch of files (same folder prefix).
 * Returns an array of URLs in original order.
 */
export async function uploadMultipleFiles(
  bucket: R2Bucket,
  folderPrefix: string,
  files: File[],
  workerBaseUrl: string
): Promise<string[]> {
  const uploads = files.map(async (file, index) => {
    const ext = mimeToExt(file.type);
    const key = `${folderPrefix}/${index}.${ext}`;
    const result = await uploadFile(bucket, key, file, workerBaseUrl);
    return { index, url: result.url };
  });

  const results = await Promise.all(uploads);
  results.sort((a, b) => a.index - b.index);
  return results.map((r) => r.url);
}

/**
 * Delete a single object from R2 by key.
 */
export async function deleteFile(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}

/**
 * Delete all objects under a folder prefix.
 * Used when deleting a job or listing (cleans up all its images).
 */
export async function deleteFolderContents(
  bucket: R2Bucket,
  prefix: string
): Promise<void> {
  const listed = await bucket.list({ prefix });
  if (listed.objects.length === 0) return;

  const keys = listed.objects.map((obj) => obj.key);
  await bucket.delete(keys);

  // Handle truncated results (more than 1000 objects)
  if (listed.truncated) {
    await deleteFolderContents(bucket, prefix);
  }
}

/**
 * Stream an R2 object as a Response, with correct Content-Type.
 * Returns null if the object does not exist.
 */
export async function serveFile(
  bucket: R2Bucket,
  key: string
): Promise<Response | null> {
  const object = await bucket.get(key);
  if (!object) return null;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
}

/**
 * Extract the worker base URL from a Hono request.
 * Falls back to a configurable env var if available.
 */
export function getWorkerBaseUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}
