/**
 * Interface for storage operations
 * This interface defines methods for file operations that can be implemented
 * by different storage providers (Firebase, Supabase, etc.)
 */
export interface StorageInterface {
  /**
   * Upload a file to storage
   * @param path The storage path to upload to
   * @param file The file to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  uploadFile(
    path: string, 
    file: File, 
    metadata?: any
  ): Promise<{ url: string; error: any }>;

  /**
   * Upload a buffer to storage
   * @param path The storage path to upload to
   * @param buffer The buffer to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  uploadBuffer(
    path: string, 
    buffer: Buffer | ArrayBuffer, 
    metadata?: any
  ): Promise<{ url: string; error: any }>;

  /**
   * Upload a data URL to storage
   * @param path The storage path to upload to
   * @param dataUrl The data URL to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  uploadDataUrl(
    path: string, 
    dataUrl: string, 
    metadata?: any
  ): Promise<{ url: string; error: any }>;

  /**
   * Get the download URL for a file
   * @param path The storage path of the file
   * @returns Object containing the download URL or error
   */
  getFileUrl(
    path: string
  ): Promise<{ url: string; error: any }>;

  /**
   * Get a signed URL for a file (for private files)
   * @param path The storage path of the file
   * @param expiresIn Expiration time in seconds
   * @returns Object containing the signed URL or error
   */
  getSignedUrl(
    path: string, 
    expiresIn?: number
  ): Promise<{ url: string; error: any }>;

  /**
   * Delete a file from storage
   * @param path The storage path of the file to delete
   * @returns Object indicating success or error
   */
  deleteFile(
    path: string
  ): Promise<{ success: boolean; error: any }>;

  /**
   * List files in a directory
   * @param path The storage path of the directory
   * @returns Object containing array of file URLs or error
   */
  listFiles(
    path: string
  ): Promise<{ files: string[]; error: any }>;
} 