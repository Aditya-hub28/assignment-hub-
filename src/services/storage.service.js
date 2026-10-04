const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

const BUCKET_NAME = 'service-request-files';

const MIME_MAP = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  txt: 'text/plain'
};

const resolveMimeType = (mimeOrExt, filename = '') => {
  if (mimeOrExt && typeof mimeOrExt === 'string' && mimeOrExt.includes('/')) {
    return mimeOrExt;
  }
  const ext = (mimeOrExt || filename.split('.').pop() || '').toLowerCase().replace(/^\./, '');
  return MIME_MAP[ext] || 'application/octet-stream';
};

class StorageService {
  constructor() {
    this.bucketName = BUCKET_NAME;
  }

  /**
   * Ensure private bucket exists in Supabase Storage
   */
  async ensureBucket() {
    try {
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
      if (error) {
        console.warn('[STORAGE] Warning listing buckets:', error.message);
        return;
      }
      const found = (buckets || []).find((b) => b.name === this.bucketName || b.id === this.bucketName);
      if (!found) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(this.bucketName, {
          public: false,
          fileSizeLimit: 52428800 // 50MB
        });
        if (createError) {
          console.warn('[STORAGE] Could not create bucket:', createError.message);
        } else {
          console.log(`[STORAGE] Created private bucket "${this.bucketName}".`);
        }
      }
    } catch (err) {
      console.warn('[STORAGE] ensureBucket error:', err.message);
    }
  }

  /**
   * Upload a service request reference file to private Supabase Storage
   * Path: service-request-files/{userId}/{requestId}/{filename}
   */
  async uploadFile({ userId, requestId, filename, buffer, mimeType, fileSize }) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Valid file buffer is required for upload.');
    }

    const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const userFolder = userId ? String(userId).trim() : 'unauthenticated';
    const storagePath = `${userFolder}/${requestId}/${safeFilename}`;
    const validMime = resolveMimeType(mimeType, safeFilename);

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .upload(storagePath, buffer, {
        contentType: validMime,
        upsert: true
      });

    if (error) {
      console.error('[STORAGE] Supabase upload failed:', error.message);
      throw new Error(`Failed to upload file to secure storage: ${error.message}`);
    }

    // Record metadata in public.service_request_files if available
    try {
      await supabaseAdmin.from('service_request_files').insert({
        request_id: requestId,
        user_id: (userId && userId !== 'unauthenticated' && userId.length === 36) ? userId : null,
        storage_path: storagePath,
        original_filename: filename,
        mime_type: mimeType || 'application/octet-stream',
        file_size: fileSize || buffer.length
      });
    } catch (metaErr) {
      // Non-fatal metadata sync warning
      console.warn('[STORAGE] Metadata table insert skipped:', metaErr.message);
    }

    return {
      storagePath,
      filename: safeFilename
    };
  }

  /**
   * Generate short-lived signed URL for a private file
   * @param {string} storagePath - path within service-request-files bucket
   * @param {number} expiresIn - duration in seconds (default: 300)
   */
  async getSignedUrl(storagePath, expiresIn = 300) {
    if (!storagePath) {
      throw new Error('Storage path is required to generate signed URL.');
    }

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.error('[STORAGE] Signed URL generation failed:', error?.message);
      throw new Error('Could not generate secure access URL for file.');
    }

    return {
      signedUrl: data.signedUrl,
      expiresIn
    };
  }

  /**
   * Download raw file buffer directly from Supabase Storage
   */
  async downloadBuffer(storagePath) {
    if (!storagePath) {
      throw new Error('Storage path is required.');
    }

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .download(storagePath);

    if (error || !data) {
      throw new Error(`File retrieval failed from storage: ${error?.message || 'Empty file'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Legacy file migration helper (Migration to Supabase Storage completed)
   */
  async migrateLocalFiles() {
    return { migratedCount: 0 };
  }
}

module.exports = new StorageService();
