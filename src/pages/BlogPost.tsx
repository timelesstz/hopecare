import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import usePosts from '../hooks/usePosts';
import AdminEditButton from '../components/AdminEditButton';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, isLoading, error } = usePosts();
  
  const post = posts.find(p => p.id === Number(id));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading post</div>;
  if (!post) return <div>Post not found</div>;

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

        <div className="prose prose-rose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
};

export default BlogPost;