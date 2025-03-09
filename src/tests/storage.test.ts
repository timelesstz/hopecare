import { storageProvider } from '../lib/storage/StorageFactory';
import { 
  uploadFile, 
  uploadBuffer, 
  uploadDataUrl, 
  getFileUrl, 
  getSignedUrl, 
  deleteFile, 
  listFiles,
  generateFilePath
} from '../utils/storageUtils';

/**
 * Storage functionality test script
 * 
 * This script tests the storage functionality using both Firebase and Supabase adapters.
 * Run this script to verify that storage operations work correctly.
 * 
 * Usage:
 * 1. Set VITE_USE_SUPABASE_STORAGE in .env to 'true' or 'false' to test different providers
 * 2. Run this script with: npx ts-node src/tests/storage.test.ts
 */

// Test configuration
const TEST_FILE_PATH = 'test/test-file.txt';
const TEST_CONTENT = 'This is a test file content';
const TEST_METADATA = { contentType: 'text/plain', customMetadata: { test: 'true' } };

// Helper function to create a test file
const createTestFile = (): File => {
  const blob = new Blob([TEST_CONTENT], { type: 'text/plain' });
  return new File([blob], 'test-file.txt', { type: 'text/plain' });
};

// Helper function to create a test buffer
const createTestBuffer = (): Buffer => {
  return Buffer.from(TEST_CONTENT);
};

// Helper function to create a test data URL
const createTestDataUrl = (): string => {
  return `data:text/plain;base64,${Buffer.from(TEST_CONTENT).toString('base64')}`;
};

// Test storage provider info
const testStorageProviderInfo = async () => {
  console.log('Testing storage provider info...');
  console.log(`Current storage provider: ${storageProvider.constructor.name}`);
  console.log('Storage provider test complete.');
};

// Test file upload
const testFileUpload = async () => {
  console.log('Testing file upload...');
  const file = createTestFile();
  const result = await uploadFile(TEST_FILE_PATH, file, TEST_METADATA);
  
  if (result.error) {
    console.error('File upload failed:', result.error);
    return false;
  }
  
  console.log('File uploaded successfully:', result.url);
  return true;
};

// Test buffer upload
const testBufferUpload = async () => {
  console.log('Testing buffer upload...');
  const buffer = createTestBuffer();
  const result = await uploadBuffer(`${TEST_FILE_PATH}-buffer`, buffer, TEST_METADATA);
  
  if (result.error) {
    console.error('Buffer upload failed:', result.error);
    return false;
  }
  
  console.log('Buffer uploaded successfully:', result.url);
  return true;
};

// Test data URL upload
const testDataUrlUpload = async () => {
  console.log('Testing data URL upload...');
  const dataUrl = createTestDataUrl();
  const result = await uploadDataUrl(`${TEST_FILE_PATH}-dataurl`, dataUrl, TEST_METADATA);
  
  if (result.error) {
    console.error('Data URL upload failed:', result.error);
    return false;
  }
  
  console.log('Data URL uploaded successfully:', result.url);
  return true;
};

// Test get file URL
const testGetFileUrl = async () => {
  console.log('Testing get file URL...');
  const result = await getFileUrl(TEST_FILE_PATH);
  
  if (result.error) {
    console.error('Get file URL failed:', result.error);
    return false;
  }
  
  console.log('File URL retrieved successfully:', result.url);
  return true;
};

// Test get signed URL
const testGetSignedUrl = async () => {
  console.log('Testing get signed URL...');
  const result = await getSignedUrl(TEST_FILE_PATH, 3600);
  
  if (result.error) {
    console.error('Get signed URL failed:', result.error);
    return false;
  }
  
  console.log('Signed URL retrieved successfully:', result.url);
  return true;
};

// Test list files
const testListFiles = async () => {
  console.log('Testing list files...');
  const result = await listFiles('test/');
  
  if (result.error) {
    console.error('List files failed:', result.error);
    return false;
  }
  
  console.log('Files listed successfully:', result.files);
  return true;
};

// Test delete file
const testDeleteFile = async () => {
  console.log('Testing delete file...');
  const result = await deleteFile(TEST_FILE_PATH);
  
  if (result.error) {
    console.error('Delete file failed:', result.error);
    return false;
  }
  
  console.log('File deleted successfully');
  
  // Also delete the other test files
  await deleteFile(`${TEST_FILE_PATH}-buffer`);
  await deleteFile(`${TEST_FILE_PATH}-dataurl`);
  
  return true;
};

// Test path generation
const testPathGeneration = () => {
  console.log('Testing path generation...');
  
  const filePath = generateFilePath('test', 'example.txt');
  console.log('Generated file path:', filePath);
  
  const userFilePath = generateFilePath('users/123', 'profile.jpg');
  console.log('Generated user file path:', userFilePath);
  
  return true;
};

// Run all tests
const runTests = async () => {
  console.log('=== STORAGE FUNCTIONALITY TESTS ===');
  console.log('Starting tests...');
  
  try {
    await testStorageProviderInfo();
    
    // Test path generation
    const pathGenResult = testPathGeneration();
    console.log(`Path generation test ${pathGenResult ? 'PASSED' : 'FAILED'}`);
    
    // Test uploads
    const fileUploadResult = await testFileUpload();
    console.log(`File upload test ${fileUploadResult ? 'PASSED' : 'FAILED'}`);
    
    const bufferUploadResult = await testBufferUpload();
    console.log(`Buffer upload test ${bufferUploadResult ? 'PASSED' : 'FAILED'}`);
    
    const dataUrlUploadResult = await testDataUrlUpload();
    console.log(`Data URL upload test ${dataUrlUploadResult ? 'PASSED' : 'FAILED'}`);
    
    // Test retrievals
    const getFileUrlResult = await testGetFileUrl();
    console.log(`Get file URL test ${getFileUrlResult ? 'PASSED' : 'FAILED'}`);
    
    const getSignedUrlResult = await testGetSignedUrl();
    console.log(`Get signed URL test ${getSignedUrlResult ? 'PASSED' : 'FAILED'}`);
    
    // Test listing
    const listFilesResult = await testListFiles();
    console.log(`List files test ${listFilesResult ? 'PASSED' : 'FAILED'}`);
    
    // Test deletion (do this last)
    const deleteFileResult = await testDeleteFile();
    console.log(`Delete file test ${deleteFileResult ? 'PASSED' : 'FAILED'}`);
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
};

// Execute tests
runTests(); 