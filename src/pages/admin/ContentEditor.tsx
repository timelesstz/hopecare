import React, { useEffect, useState } from 'react';
import { useSupabaseCMS } from '../../context/SupabaseCMSContext';
import { PencilIcon, TrashIcon, PlusIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';

const ContentEditor: React.FC = () => {
  const { 
    blogPosts, 
    pages, 
    loading, 
    error, 
    refreshBlogPosts, 
    refreshPages, 
    deleteBlogPost, 
    deletePage 
  } = useSupabaseCMS();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    refreshBlogPosts();
    refreshPages();
  }, [refreshBlogPosts, refreshPages]);

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.meta_description && page.meta_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteBlogPost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogPost(id);
      } catch (error) {
        console.error('Failed to delete blog post:', error);
      }
    }
  };

  const handleDeletePage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage(id);
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={() => {
            refreshBlogPosts();
            refreshPages();
          }}
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/admin/content/blog/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Blog Post
          </button>
          <button
            onClick={() => navigate('/admin/content/page/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Page
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ${
                selected
                  ? 'bg-white shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Blog Posts
            </div>
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ${
                selected
                  ? 'bg-white shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center justify-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Pages
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredBlogPosts.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No blog posts found
                  </li>
                ) : (
                  filteredBlogPosts.map((post) => (
                    <li key={post.id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            {post.featured_image ? (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {post.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {post.excerpt ? post.excerpt.substring(0, 100) + '...' : 'No excerpt'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${post.status === 'published' ? 'bg-green-100 text-green-800' : 
                                post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {post.status || 'draft'}
                            </span>
                            <span className="ml-2">
                              {new Date(post.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => navigate(`/admin/content/blog/edit/${post.id}`)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-gray-100"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlogPost(post.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-red-500 hover:bg-red-100"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPages.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No pages found
                  </li>
                ) : (
                  filteredPages.map((page) => (
                    <li key={page.id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            {page.featured_image ? (
                              <img
                                src={page.featured_image}
                                alt={page.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <DocumentIcon className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {page.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {page.meta_description ? page.meta_description.substring(0, 100) + '...' : 'No description'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${page.status === 'published' ? 'bg-green-100 text-green-800' : 
                                page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {page.status || 'draft'}
                            </span>
                            <span className="ml-2">
                              {new Date(page.updated_at).toLocaleDateString()}
                            </span>
                            {page.template && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {page.template}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => navigate(`/admin/content/page/edit/${page.id}`)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-gray-100"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-red-500 hover:bg-red-100"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ContentEditor;
