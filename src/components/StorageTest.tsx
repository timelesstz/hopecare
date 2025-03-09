import React, { useState } from 'react';
import { runAllTests, testFileUpload, testListFiles, testDeleteFile } from '../lib/storage/StorageTest';
import { storageProvider } from '../lib/storage/StorageFactory';

/**
 * A component to test the storage adapters
 */
const StorageTest: React.FC = () => {
  const [results, setResults] = useState<{
    uploadTest?: { success: boolean; message: string; url?: string };
    listTest?: { success: boolean; message: string; files?: string[] };
    deleteTest?: { success: boolean; message: string };
  }>({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState('test');
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [provider, setProvider] = useState<string>('');

  // Get the current storage provider name when component mounts
  React.useEffect(() => {
    // Check if we're using Supabase or Firebase
    const providerName = storageProvider.constructor.name;
    setProvider(providerName);
  }, []);

  const handleRunAllTests = async () => {
    setLoading(true);
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
      setResults({
        uploadTest: { 
          success: false, 
          message: `Error: ${error instanceof Error ? error.message : String(error)}` 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const path = `${uploadPath}/${Date.now()}-${selectedFile.name}`;
      const result = await storageProvider.uploadFile(path, selectedFile);
      
      if (result.error) {
        setUploadResult({
          success: false,
          message: `Upload failed: ${result.error}`
        });
      } else {
        setUploadResult({
          success: true,
          message: 'File uploaded successfully',
          url: result.url
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Storage Adapter Test</h2>
      <div className="mb-4 p-2 bg-blue-50 rounded">
        <p>Current storage provider: <strong>{provider}</strong></p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Run Automated Tests</h3>
        <button 
          onClick={handleRunAllTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        {Object.keys(results).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold">Test Results:</h4>
            
            {results.uploadTest && (
              <div className={`mt-2 p-2 rounded ${results.uploadTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>Upload Test:</strong> {results.uploadTest.message}</p>
                {results.uploadTest.url && (
                  <p className="mt-1">
                    URL: <a href={results.uploadTest.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {results.uploadTest.url}
                    </a>
                  </p>
                )}
              </div>
            )}
            
            {results.listTest && (
              <div className={`mt-2 p-2 rounded ${results.listTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>List Files Test:</strong> {results.listTest.message}</p>
                {results.listTest.files && results.listTest.files.length > 0 && (
                  <div className="mt-1">
                    <p>Files:</p>
                    <ul className="list-disc pl-5">
                      {results.listTest.files.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {results.deleteTest && (
              <div className={`mt-2 p-2 rounded ${results.deleteTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>Delete Test:</strong> {results.deleteTest.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Manual File Upload Test</h3>
        <div className="flex flex-col space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Path</label>
            <input
              type="text"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Select File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>
          
          <button
            onClick={handleUploadFile}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
        
        {uploadResult && (
          <div className={`mt-4 p-3 rounded ${uploadResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p>{uploadResult.message}</p>
            {uploadResult.url && (
              <p className="mt-1">
                URL: <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {uploadResult.url}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageTest; 