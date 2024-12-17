import { useState } from 'react';
import { Save, X, List, Bold, Italic, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Editor, EditorContent } from '@tiptap/react';

interface Post {
  id: number;
  title: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  category: string;
  author: string;
  date: string;
  featured: boolean;
  tags: string[];
}

interface PostEditorProps {
  post: Post | null;
  setPost: (post: Post | null) => void;
  categories: string[];
  editor: Editor | null;
  onSave: () => void;
  onCancel: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const PostEditor: React.FC<PostEditorProps> = ({
  post,
  setPost,
  categories,
  editor,
  onSave,
  onCancel,
  saveStatus
}) => {
  const [newTag, setNewTag] = useState('');

  if (!post || !editor) return null;

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved!';
      case 'error':
        return 'Error saving';
      default:
        return 'Save';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {post.id ? 'Edit Post' : 'New Post'}
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center px-4 py-2 rounded-md transition ${
              saveStatus === 'saving' || saveStatus === 'saved'
                ? 'bg-gray-400 cursor-not-allowed'
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-rose-600 hover:bg-rose-700'
            } text-white`}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {getSaveButtonText()}
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            placeholder="Enter post title"
          />
        </div>

        <div>
          <div className="border border-gray-200 rounded-t-lg p-2 mb-1 flex space-x-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bold') ? 'bg-gray-100' : ''
              }`}
            >
              <Bold className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('italic') ? 'bg-gray-100' : ''
              }`}
            >
              <Italic className="h-5 w-5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bulletList') ? 'bg-gray-100' : ''
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <div className="border border-gray-200 rounded-b-lg p-4 min-h-[300px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value as Post['status'] })}
              className="w-full border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Post
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={post.featured}
              onChange={(e) => setPost({ ...post, featured: e.target.checked })}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="ml-2 text-gray-700">Mark as featured post</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;