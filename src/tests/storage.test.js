import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { storageUtils } from '../utils/storageUtils';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  listAll: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
  storage: {}
}));

describe('Firebase Storage Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Upload Operations', () => {
    it('should upload a file to storage', async () => {
      // Mock successful file upload
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadResult = { metadata: { fullPath: 'images/test.jpg' } };
      const mockDownloadURL = 'https://firebasestorage.googleapis.com/images/test.jpg';
      
      ref.mockReturnValueOnce('storage-ref');
      uploadBytes.mockResolvedValueOnce(mockUploadResult);
      getDownloadURL.mockResolvedValueOnce(mockDownloadURL);

      const result = await storageUtils.uploadFile(mockFile, 'images');

      expect(ref).toHaveBeenCalledWith(storage, 'images/test.jpg');
      expect(uploadBytes).toHaveBeenCalledWith('storage-ref', mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith('storage-ref');
      expect(result).toEqual({
        path: 'images/test.jpg',
        url: mockDownloadURL
      });
    });

    it('should handle errors when uploading a file', async () => {
      // Mock error during file upload
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Failed to upload file');
      
      ref.mockReturnValueOnce('storage-ref');
      uploadBytes.mockRejectedValueOnce(mockError);

      await expect(storageUtils.uploadFile(mockFile, 'images'))
        .rejects.toThrow('Failed to upload file');

      expect(ref).toHaveBeenCalledWith(storage, 'images/test.jpg');
      expect(uploadBytes).toHaveBeenCalledWith('storage-ref', mockFile);
    });

    it('should generate a unique filename when requested', async () => {
      // Mock successful file upload with unique filename
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadResult = { metadata: { fullPath: 'images/unique-id-test.jpg' } };
      const mockDownloadURL = 'https://firebasestorage.googleapis.com/images/unique-id-test.jpg';
      
      // Mock Date.now and Math.random for predictable unique IDs
      const originalDateNow = Date.now;
      const originalMathRandom = Math.random;
      Date.now = vi.fn(() => 1234567890);
      Math.random = vi.fn(() => 0.123456789);
      
      ref.mockReturnValueOnce('storage-ref');
      uploadBytes.mockResolvedValueOnce(mockUploadResult);
      getDownloadURL.mockResolvedValueOnce(mockDownloadURL);

      const result = await storageUtils.uploadFile(mockFile, 'images', true);

      expect(ref).toHaveBeenCalledWith(storage, expect.stringContaining('images/'));
      expect(ref).toHaveBeenCalledWith(storage, expect.stringContaining('test.jpg'));
      expect(uploadBytes).toHaveBeenCalledWith('storage-ref', mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith('storage-ref');
      expect(result).toEqual({
        path: 'images/unique-id-test.jpg',
        url: mockDownloadURL
      });
      
      // Restore original functions
      Date.now = originalDateNow;
      Math.random = originalMathRandom;
    });
  });

  describe('Download Operations', () => {
    it('should get a download URL for a file', async () => {
      // Mock successful URL retrieval
      const mockDownloadURL = 'https://firebasestorage.googleapis.com/images/test.jpg';
      
      ref.mockReturnValueOnce('storage-ref');
      getDownloadURL.mockResolvedValueOnce(mockDownloadURL);

      const result = await storageUtils.getFileURL('images/test.jpg');

      expect(ref).toHaveBeenCalledWith(storage, 'images/test.jpg');
      expect(getDownloadURL).toHaveBeenCalledWith('storage-ref');
      expect(result).toBe(mockDownloadURL);
    });

    it('should handle errors when getting a download URL', async () => {
      // Mock error during URL retrieval
      const mockError = new Error('File not found');
      
      ref.mockReturnValueOnce('storage-ref');
      getDownloadURL.mockRejectedValueOnce(mockError);

      await expect(storageUtils.getFileURL('images/nonexistent.jpg'))
        .rejects.toThrow('File not found');

      expect(ref).toHaveBeenCalledWith(storage, 'images/nonexistent.jpg');
      expect(getDownloadURL).toHaveBeenCalledWith('storage-ref');
    });
  });

  describe('Delete Operations', () => {
    it('should delete a file from storage', async () => {
      // Mock successful file deletion
      ref.mockReturnValueOnce('storage-ref');
      deleteObject.mockResolvedValueOnce({});

      await storageUtils.deleteFile('images/test.jpg');

      expect(ref).toHaveBeenCalledWith(storage, 'images/test.jpg');
      expect(deleteObject).toHaveBeenCalledWith('storage-ref');
    });

    it('should handle errors when deleting a file', async () => {
      // Mock error during file deletion
      const mockError = new Error('File not found');
      
      ref.mockReturnValueOnce('storage-ref');
      deleteObject.mockRejectedValueOnce(mockError);

      await expect(storageUtils.deleteFile('images/nonexistent.jpg'))
        .rejects.toThrow('File not found');

      expect(ref).toHaveBeenCalledWith(storage, 'images/nonexistent.jpg');
      expect(deleteObject).toHaveBeenCalledWith('storage-ref');
    });
  });

  describe('List Operations', () => {
    it('should list all files in a directory', async () => {
      // Mock successful file listing
      const mockItems = [
        { name: 'test1.jpg', fullPath: 'images/test1.jpg' },
        { name: 'test2.jpg', fullPath: 'images/test2.jpg' }
      ];
      const mockResult = { items: mockItems, prefixes: [] };
      
      ref.mockReturnValueOnce('storage-ref');
      listAll.mockResolvedValueOnce(mockResult);

      const result = await storageUtils.listFiles('images');

      expect(ref).toHaveBeenCalledWith(storage, 'images');
      expect(listAll).toHaveBeenCalledWith('storage-ref');
      expect(result).toEqual(mockItems);
    });

    it('should handle errors when listing files', async () => {
      // Mock error during file listing
      const mockError = new Error('Directory not found');
      
      ref.mockReturnValueOnce('storage-ref');
      listAll.mockRejectedValueOnce(mockError);

      await expect(storageUtils.listFiles('nonexistent-dir'))
        .rejects.toThrow('Directory not found');

      expect(ref).toHaveBeenCalledWith(storage, 'nonexistent-dir');
      expect(listAll).toHaveBeenCalledWith('storage-ref');
    });
  });
}); 