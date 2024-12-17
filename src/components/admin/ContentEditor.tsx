import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface ContentBlock {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'post' | 'program';
  status: 'draft' | 'published';
}

const ContentEditor: React.FC = () => {
  const [activeContent, setActiveContent] = useState<ContentBlock | null>(null);
  const [contentList, setContentList] = useState<ContentBlock[]>([]);

  const handleEditorChange = (content: string) => {
    if (activeContent) {
      setActiveContent({ ...activeContent, content });
    }
  };

  const handleSave = () => {
    if (activeContent) {
      const updatedList = contentList.map(item =>
        item.id === activeContent.id ? activeContent : item
      );
      setContentList(updatedList);
      // TODO: Implement API call to save content
    }
  };

  const createNewContent = () => {
    const newContent: ContentBlock = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      type: 'page',
      status: 'draft'
    };
    setContentList([...contentList, newContent]);
    setActiveContent(newContent);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
          <button
            onClick={createNewContent}
            className="bg-hopecare-blue text-white px-4 py-2 rounded-md hover:bg-hopecare-blue-dark"
          >
            New Content
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Content List Sidebar */}
          <div className="col-span-3 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Content List</h2>
            <div className="space-y-2">
              {contentList.map(content => (
                <div
                  key={content.id}
                  onClick={() => setActiveContent(content)}
                  className={`p-2 rounded cursor-pointer ${
                    activeContent?.id === content.id
                      ? 'bg-hopecare-blue text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{content.title}</div>
                  <div className="text-sm">{content.type} • {content.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="col-span-9 bg-white rounded-lg shadow p-4">
            {activeContent ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={activeContent.title}
                  onChange={(e) => setActiveContent({ ...activeContent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter title"
                />
                <div className="flex space-x-4 mb-4">
                  <select
                    value={activeContent.type}
                    onChange={(e) => setActiveContent({ ...activeContent, type: e.target.value as ContentBlock['type'] })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="page">Page</option>
                    <option value="post">Post</option>
                    <option value="program">Program</option>
                  </select>
                  <select
                    value={activeContent.status}
                    onChange={(e) => setActiveContent({ ...activeContent, status: e.target.value as ContentBlock['status'] })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <Editor
                  apiKey="your-tinymce-api-key" // TODO: Add your TinyMCE API key
                  value={activeContent.content}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help'
                  }}
                  onEditorChange={handleEditorChange}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setActiveContent(null)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-hopecare-blue text-white rounded-md hover:bg-hopecare-blue-dark"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a content item or create a new one to start editing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
