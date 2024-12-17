import React, { useState } from 'react';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const news = [
  {
    id: 1,
    title: "New Education Center Opens in Arusha",
    excerpt: "Expanding our reach to provide quality education to more children in the community.",
    date: "March 15, 2024",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80",
    category: "Education",
    readTime: "3 min read"
  },
  {
    id: 2,
    title: "Community Health Initiative Reaches Milestone",
    excerpt: "Over 1,000 families have benefited from our healthcare programs this year.",
    date: "March 10, 2024",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80",
    category: "Health",
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "Volunteer Training Program Launches",
    excerpt: "New program aims to enhance skills and impact of our volunteer network.",
    date: "March 5, 2024",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80",
    category: "Community",
    readTime: "5 min read"
  }
];

const LatestNews = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', ...new Set(news.map(item => item.category.toLowerCase()))];

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category.toLowerCase() === activeCategory);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with our latest initiatives, success stories, and community impact.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {filteredNews.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      to={`/news/${item.id}`}
                      className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
                    >
                      Read More
                    </Link>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{item.date}</span>
                    <span className="mx-2">•</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>
                  <Link
                    to={`/news/${item.id}`}
                    className="inline-flex items-center text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Read Full Story
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/news"
            className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            View All News
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestNews;