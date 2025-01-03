import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
}

const MediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: MediaItem[] = acceptedFiles.map(file => ({
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date()
    }));
    setMediaItems(prev => [...prev, ...newItems]);
    // TODO: Implement actual file upload to backend
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm']
    }
  });

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedItems = () => {
    setMediaItems(prev =>
      prev.filter(item => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
    // TODO: Implement deletion on backend
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sortedMediaItems = [...mediaItems].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.uploadDate.getTime() - a.uploadDate.getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <div className="flex space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <button
              onClick={() => setView(prev => prev === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              {view === 'grid' ? '📋 List View' : '📑 Grid View'}
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={deleteSelectedItems}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center ${
            isDragActive ? 'border-hopecare-blue bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-lg text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PNG, JPG, GIF, PDF, MP4, WEBM
          </p>
        </div>

        {/* Media Items Display */}
        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedMediaItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItemSelection(item.id)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                  selectedItems.includes(item.id)
                    ? 'ring-2 ring-hopecare-blue'
                    : ''
                }`}
              >
                {item.type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">
                      {item.type.includes('pdf') ? '📄' : '📁'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-90">
                  <p className="text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMediaItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedItems.includes(item.id)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {item.type.startsWith('image/')
                            ? '🖼️'
                            : item.type.includes('pdf')
                            ? '📄'
                            : '📁'}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.uploadDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
