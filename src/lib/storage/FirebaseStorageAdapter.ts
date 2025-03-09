import { StorageInterface } from './StorageInterface';
import { storage } from '../firebase';
import { 
  ref, 
  uploadBytes, 
  uploadString, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  UploadMetadata
} from 'firebase/storage';

/**
 * Firebase Storage adapter
 * Implements the StorageInterface for Firebase Storage
 */
export class FirebaseStorageAdapter implements StorageInterface {
  /**
   * Upload a file to Firebase Storage
   * @param path The storage path to upload to
   * @param file The file to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadFile(
    path: string, 
    file: File, 
    metadata?: UploadMetadata
  ): Promise<{ url: string; error: any }> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Upload a buffer to Firebase Storage
   * @param path The storage path to upload to
   * @param buffer The buffer to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadBuffer(
    path: string, 
    buffer: Buffer | ArrayBuffer, 
    metadata?: UploadMetadata
  ): Promise<{ url: string; error: any }> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, buffer, metadata);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error) {
      console.error('Error uploading buffer to Firebase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Upload a data URL to Firebase Storage
   * @param path The storage path to upload to
   * @param dataUrl The data URL to upload
   * @param metadata Optional metadata for the file
   * @returns Object containing the download URL or error
   */
  async uploadDataUrl(
    path: string, 
    dataUrl: string, 
    metadata?: UploadMetadata
  ): Promise<{ url: string; error: any }> {
    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, 'data_url', metadata);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error) {
      console.error('Error uploading data URL to Firebase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Get the download URL for a file in Firebase Storage
   * @param path The storage path of the file
   * @returns Object containing the download URL or error
   */
  async getFileUrl(path: string): Promise<{ url: string; error: any }> {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error) {
      console.error('Error getting file URL from Firebase Storage:', error);
      return { url: '', error };
    }
  }

  /**
   * Get a signed URL for a file in Firebase Storage
   * @param path The storage path of the file
   * @param expiresIn Expiration time in seconds
   * @returns Object containing the signed URL or error
   */
  async getSignedUrl(
    path: string, 
    expiresIn: number = 3600
  ): Promise<{ url: string; error: any }> {
    // Firebase Storage URLs already include a token
    return this.getFileUrl(path);
  }

  /**
   * Delete a file from Firebase Storage
   * @param path The storage path of the file to delete
   * @returns Object indicating success or error
   */
  async deleteFile(path: string): Promise<{ success: boolean; error: any }> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting file from Firebase Storage:', error);
      return { success: false, error };
    }
  }

  /**
   * List files in a directory in Firebase Storage
   * @param path The storage path of the directory
   * @returns Object containing array of file URLs or error
   */
  async listFiles(path: string): Promise<{ files: string[]; error: any }> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const urlPromises = result.items.map(itemRef => getDownloadURL(itemRef));
      const urls = await Promise.all(urlPromises);
      
      return { files: urls, error: null };
    } catch (error) {
      console.error('Error listing files from Firebase Storage:', error);
      return { files: [], error };
    }
  }
} 