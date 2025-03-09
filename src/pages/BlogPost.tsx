import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import usePosts from '../hooks/usePosts';
import AdminEditButton from '../components/AdminEditButton';
import { createSafeHtml } from '../utils/htmlUtils';
import { handleError, ErrorType } from '../utils/errorUtils';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, isLoading, error } = usePosts();
  
  // Handle error with our error utility
  if (error) {
    handleError(error, ErrorType.UNKNOWN, {
      context: 'blog-post',
      userMessage: 'Failed to load blog post'
    });
    return <div className="p-4 text-red-600">Failed to load blog post. Please try again later.</div>;
  }
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }
  
  const post = posts.find(p => p.id === Number(id));
  
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center text-rose-600 hover:text-rose-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AdminEditButton pageId={`blog-${id}`} />
      
      <button
        onClick={() => navigate('/blog')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Blog
      </button>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="mr-4">{post.date}</span>
            <User className="h-5 w-5 mr-2" />
            <span>{post.author}</span>
          </div>
        </header>

        <div 
          className="prose prose-rose max-w-none" 
          {...createSafeHtml(post.content)}
        />
      </article>
    </div>
  );
};

export default BlogPost;