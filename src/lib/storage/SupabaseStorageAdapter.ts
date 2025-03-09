import { StorageInterface } from './StorageInterface';
import { supabase } from '../supabase';

/**
 * Supabase Storage adapter
 * Implements the StorageInterface for Supabase Storage
 */
export class SupabaseStorageAdapter implements StorageInterface {
  /**
   * Parse a path into bucket and filename
   * @param path The path in format "bucket/filename"
   * @returns Object with bucket and filename
   */
  private parsePath(path: string): { bucket: string; filename: string } {
    const parts = path.split('/');
    const bucket = parts[0];
    const filename = parts.slice(1).join('/');
    
    return {
      bucket,
      filename: filename || path // If no slash, use the whole path as filename
    };
  }

  /**
   * Upload a file to Supabase Storage
   * @param path The storage path to upload to
   * @param file The file to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadFile(
    path: string, 
    file: File, 
    metadata?: any
  ): Promise<{ url: string; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
          ...metadata
        });
      
      if (error) {
        throw error;
      }
      
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filename);
      
      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Upload a buffer to Supabase Storage
   * @param path The storage path to upload to
   * @param buffer The buffer to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadBuffer(
    path: string, 
    buffer: Buffer | ArrayBuffer, 
    metadata?: any
  ): Promise<{ url: string; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: metadata?.contentType || 'application/octet-stream',
          ...metadata
        });
      
      if (error) {
        throw error;
      }
      
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filename);
      
      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading buffer to Supabase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Upload a data URL to Supabase Storage
   * @param path The storage path to upload to
   * @param dataUrl The data URL to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadDataUrl(
    path: string, 
    dataUrl: string, 
    metadata?: any
  ): Promise<{ url: string; error: any }> {
    try {
      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], path.split('/').pop() || 'file', { type: blob.type });
      
      // Use uploadFile method
      return this.uploadFile(path, file, metadata);
    } catch (error) {
      console.error('Error uploading data URL to Supabase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Get the download URL for a file in Supabase Storage
   * @param path The storage path of the file
   * @returns Object containing the download URL or error
   */
  async getFileUrl(path: string): Promise<{ url: string; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filename);
      
      if (error) {
        throw error;
      }
      
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Error getting file URL from Supabase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Get a signed URL for a file in Supabase Storage
   * @param path The storage path of the file
   * @param expiresIn Expiration time in seconds
   * @returns Object containing the signed URL or error
   */
  async getSignedUrl(
    path: string, 
    expiresIn: number = 3600
  ): Promise<{ url: string; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filename, expiresIn);
      
      if (error) {
        throw error;
      }
      
      return { url: data.signedUrl, error: null };
    } catch (error) {
      console.error('Error getting signed URL from Supabase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param path The storage path of the file to delete
   * @returns Object indicating success or error
   */
  async deleteFile(path: string): Promise<{ success: boolean; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filename]);
      
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return { success: false, error };
    }
  }

  /**
   * List files in a directory in Supabase Storage
   * @param path The storage path of the directory
   * @returns Object containing array of file URLs or error
   */
  async listFiles(path: string): Promise<{ files: string[]; error: any }> {
    try {
      const { bucket, filename } = this.parsePath(path);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(filename, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URLs for all files
      const urls = await Promise.all(
        data.map(async (file) => {
          const filePath = filename ? `${filename}/${file.name}` : file.name;
          const { data } = await supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          return data.publicUrl;
        })
      );
      
      return { files: urls, error: null };
    } catch (error) {
      console.error('Error listing files from Supabase Storage:', error);
      return { files: [], error };
    }
  }
} 