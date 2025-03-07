import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  uploadString,
  UploadMetadata
} from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Utility functions for Firebase Storage
 */

interface StorageResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Upload a file to Firebase Storage
 * @param path The storage path to upload to
 * @param file The file to upload
 * @param metadata Optional metadata for the file
 * @returns The download URL or error
 */
export async function uploadFile(
  path: string, 
  file: File, 
  metadata?: UploadMetadata
): Promise<StorageResponse<string>> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    
    const downloadURL = await getDownloadURL(storageRef);
    return { data: downloadURL, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    };
  }
}

/**
 * Upload a data URL to Firebase Storage
 * @param path The storage path to upload to
 * @param dataUrl The data URL to upload
 * @param metadata Optional metadata for the file
 * @returns The download URL or error
 */
export async function uploadDataUrl(
  path: string, 
  dataUrl: string, 
  metadata?: UploadMetadata
): Promise<StorageResponse<string>> {
  try {
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, 'data_url', metadata);
    
    const downloadURL = await getDownloadURL(storageRef);
    return { data: downloadURL, error: null };
  } catch (error) {
    console.error('Error uploading data URL:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to upload data URL' 
    };
  }
}

/**
 * Get the download URL for a file in Firebase Storage
 * @param path The storage path of the file
 * @returns The download URL or error
 */
export async function getFileUrl(path: string): Promise<StorageResponse<string>> {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { data: downloadURL, error: null };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to get file URL' 
    };
  }
}

/**
 * Delete a file from Firebase Storage
 * @param path The storage path of the file to delete
 * @returns Success status or error
 */
export async function deleteFile(path: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete file' 
    };
  }
}

/**
 * List all files in a directory in Firebase Storage
 * @param path The storage path of the directory
 * @returns Array of file references or error
 */
export async function listFiles(path: string): Promise<StorageResponse<string[]>> {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    // Get download URLs for all items
    const downloadURLs = await Promise.all(
      result.items.map(itemRef => getDownloadURL(itemRef))
    );
    
    return { data: downloadURLs, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to list files' 
    };
  }
}

/**
 * Generate a unique file path for Firebase Storage
 * @param directory The directory to store the file in
 * @param fileName The original file name
 * @returns A unique file path
 */
export function generateFilePath(directory: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  
  return `${directory}/${timestamp}-${randomString}.${extension}`;
}

/**
 * Generate a user-specific file path
 * @param userId The user ID
 * @param fileName The original file name
 * @returns A user-specific file path
 */
export function generateUserFilePath(userId: string, fileName: string): string {
  return generateFilePath(`users/${userId}`, fileName);
}

/**
 * Generate a project-specific file path
 * @param projectId The project ID
 * @param fileName The original file name
 * @returns A project-specific file path
 */
export function generateProjectFilePath(projectId: string, fileName: string): string {
  return generateFilePath(`projects/${projectId}`, fileName);
}

/**
 * Generate an event-specific file path
 * @param eventId The event ID
 * @param fileName The original file name
 * @returns An event-specific file path
 */
export function generateEventFilePath(eventId: string, fileName: string): string {
  return generateFilePath(`events/${eventId}`, fileName);
}

export default {
  uploadFile,
  uploadDataUrl,
  getFileUrl,
  deleteFile,
  listFiles,
  generateFilePath,
  generateUserFilePath,
  generateProjectFilePath,
  generateEventFilePath
};