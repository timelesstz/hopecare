import { useState } from 'react';
import { FileText, Edit2, Trash2, Plus, Search, Layout } from 'lucide-react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import PostEditor from './PostEditor';
import PostList from './PostList';
import PageManager from './PageManager';

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

const ContentManagement = () => {
  const [activeView, setActiveView] = useState<'posts' | 'pages'>('posts');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "Making a Difference in Our Community",
      content: "Lorem ipsum dolor sit amet...",
      status: "published",
      category: "Impact Stories",
      author: "John Doe",
      date: "2024-03-15",
      featured: true,
      tags: ["community", "impact", "volunteering"]
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: selectedPost?.content || '',
  });

  const categories = ["Impact Stories", "Volunteer Stories", "News", "Events", "Resources"];

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditing(true);
    editor?.commands.setContent(post.content);
  };

  const handleSave = async () => {
    if (!selectedPost) return;

    setSaveStatus('saving');
    try {
      const updatedPost = {
        ...selectedPost,
        content: editor?.getHTML() || '',
        date: new Date().toISOString().split('T')[0]
      };

      if (!updatedPost.id) {
        updatedPost.id = posts.length + 1;
        setPosts([...posts, updatedPost]);
      } else {
        setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setSaveStatus('saved');
      setTimeout(() => {
        setIsEditing(false);
        setSelectedPost(null);
        setSaveStatus('idle');
      }, 1000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save post:', error);
    }
  };

  const handleCreate = () => {
    const newPost: Post = {
      id: 0,
      title: '',
      content: '',
      status: 'draft',
      category: categories[0],
      author: 'Current User',
      date: new Date().toISOString().split('T')[0],
      featured: false,
      tags: []
    };
    setSelectedPost(newPost);
    setIsEditing(true);
    editor?.commands.setContent('');
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveView('posts')}
          className={`py-4 px-6 focus:outline-none ${
            activeView === 'posts'
              ? 'border-b-2 border-rose-500 text-rose-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Blog Posts</span>
          </div>
        </button>
        <button
          onClick={() => setActiveView('pages')}
          className={`py-4 px-6 focus:outline-none ${
            activeView === 'pages'
              ? 'border-b-2 border-rose-500 text-rose-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Pages</span>
          </div>
        </button>
      </div>

      {/* Content Area */}
      {activeView === 'posts' ? (
        !isEditing ? (
          <PostList
            posts={posts}
            filter={filter}
            setFilter={setFilter}
            categories={categories}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDelete}
          />
        ) : (
          <PostEditor
            post={selectedPost}
            setPost={setSelectedPost}
            categories={categories}
            editor={editor}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setSelectedPost(null);
              setSaveStatus('idle');
            }}
            saveStatus={saveStatus}
          />
        )
      ) : (
        <PageManager />
      )}
    </div>
  );
};

export default ContentManagement;