import { storageProvider } from './StorageFactory';

/**
 * This file contains functions to test the storage adapters.
 * It can be used to verify that both Firebase and Supabase storage adapters
 * are working correctly.
 */

/**
 * Tests uploading a file and then retrieving its URL
 * @returns The result of the test
 */
export async function testFileUpload(): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> {
  try {
    // Create a simple text file for testing
    const content = 'This is a test file created at ' + new Date().toISOString();
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });
    
    // Upload the file
    const path = `test/test-${Date.now()}.txt`;
    console.log(`Testing upload to path: ${path}`);
    
    const uploadResult = await storageProvider.uploadFile(path, file);
    
    if (uploadResult.error) {
      return {
        success: false,
        message: `Upload failed: ${uploadResult.error}`,
      };
    }
    
    // Get the URL
    const urlResult = await storageProvider.getFileUrl(path);
    
    if (urlResult.error) {
      return {
        success: false,
        message: `Getting URL failed: ${urlResult.error}`,
      };
    }
    
    return {
      success: true,
      message: 'File upload and URL retrieval successful',
      url: urlResult.url,
    };
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Tests listing files in a directory
 * @returns The result of the test
 */
export async function testListFiles(): Promise<{
  success: boolean;
  message: string;
  files?: string[];
}> {
  try {
    const path = 'test';
    console.log(`Testing listing files in path: ${path}`);
    
    const result = await storageProvider.listFiles(path);
    
    if (result.error) {
      return {
        success: false,
        message: `Listing files failed: ${result.error}`,
      };
    }
    
    return {
      success: true,
      message: `Found ${result.files.length} files in the test directory`,
      files: result.files,
    };
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Tests deleting a file
 * @param path The path to the file to delete
 * @returns The result of the test
 */
export async function testDeleteFile(path: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`Testing deleting file at path: ${path}`);
    
    const result = await storageProvider.deleteFile(path);
    
    if (result.error) {
      return {
        success: false,
        message: `Deleting file failed: ${result.error}`,
      };
    }
    
    return {
      success: true,
      message: 'File deletion successful',
    };
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Runs all storage tests
 * @returns The results of all tests
 */
export async function runAllTests(): Promise<{
  uploadTest: { success: boolean; message: string; url?: string };
  listTest: { success: boolean; message: string; files?: string[] };
  deleteTest?: { success: boolean; message: string };
}> {
  // Test upload
  const uploadResult = await testFileUpload();
  console.log('Upload test result:', uploadResult);
  
  // Test list files
  const listResult = await testListFiles();
  console.log('List files test result:', listResult);
  
  // Test delete if upload was successful
  let deleteResult;
  if (uploadResult.success && uploadResult.url) {
    // Extract path from URL or use a known path
    const path = uploadResult.url.split('/').pop();
    if (path) {
      deleteResult = await testDeleteFile(`test/${path}`);
      console.log('Delete test result:', deleteResult);
    }
  }
  
  return {
    uploadTest: uploadResult,
    listTest: listResult,
    deleteTest: deleteResult,
  };
} 