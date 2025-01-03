import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabaseClient';
import { XMarkIcon, ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
}

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        return {
          id: fileName,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          created_at: new Date().toISOString(),
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setMediaFiles((prev) => [...newFiles, ...prev]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
    },
  });

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const { error } = await supabase.storage
          .from('public')
          .remove([`media/${fileId}`]);

        if (error) throw error;

        setMediaFiles((prev) => prev.filter((file) => file.id !== fileId));
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredFiles = mediaFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Media Library</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-500'}`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports: Images (PNG, JPG, GIF) and PDF files
        </p>
      </div>

      {uploading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading files...</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden">
            {file.type.startsWith('image/') ? (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-100">
                <div className="text-4xl">📄</div>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </h3>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
              <button
                onClick={() => copyToClipboard(file.url)}
                className={`mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md 
                  ${copied === file.url
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <ClipboardIcon className="h-4 w-4 mr-1" />
                {copied === file.url ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
