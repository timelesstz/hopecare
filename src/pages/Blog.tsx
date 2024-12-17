import React from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminEditButton from '../components/AdminEditButton';
import usePosts from '../hooks/usePosts';

const Blog = () => {
  const { posts, isLoading, error } = usePosts();

  if (error) return <div>Failed to load posts</div>;
  if (isLoading) return <div>Loading...</div>;

  const featuredPost = posts.find(post => post.featured) || posts[0];
  const regularPosts = posts.filter(post => post !== featuredPost);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AdminEditButton pageId="blog" />
      
      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Story</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-48 w-full object-cover md:h-full md:w-48"
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
                  alt={featuredPost.title}
                />
              </div>
              <div className="p-8">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {featuredPost.date}
                  <User className="h-4 w-4 ml-4 mr-2" />
                  {featuredPost.author}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                <div className="prose prose-rose mb-4" dangerouslySetInnerHTML={{ __html: featuredPost.content.slice(0, 200) + '...' }} />
                <Link to={`/blog/${featuredPost.id}`} className="text-rose-600 hover:text-rose-700 font-medium flex items-center">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regularPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              className="h-48 w-full object-cover"
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
              alt={post.title}
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {post.date}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
              <div className="prose prose-rose mb-4" dangerouslySetInnerHTML={{ __html: post.content.slice(0, 100) + '...' }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {post.author}
                </div>
                <Link to={`/blog/${post.id}`} className="text-rose-600 hover:text-rose-700 font-medium flex items-center">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;