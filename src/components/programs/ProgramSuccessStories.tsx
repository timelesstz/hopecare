import React from 'react';
import Image from '../common/Image';
import { motion } from 'framer-motion';
import { Play, Quote } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  description: string;
  image: string;
  video?: string;
  quote: string;
  author: string;
  role: string;
}

interface ProgramSuccessStoriesProps {
  stories: Story[];
  category: 'education' | 'health' | 'economic';
}

const ProgramSuccessStories: React.FC<ProgramSuccessStoriesProps> = ({ stories, category }) => {
  const categoryColors = {
    education: 'bg-blue-50 text-blue-600',
    health: 'bg-green-50 text-green-600',
    economic: 'bg-purple-50 text-purple-600'
  };

  const containerColors = {
    education: 'from-blue-500 to-indigo-600',
    health: 'from-green-500 to-teal-600',
    economic: 'from-purple-500 to-pink-600'
  };

  return (
    <div className="py-12">
      <div className={`bg-gradient-to-r ${containerColors[category]} rounded-3xl overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Success Stories</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Real stories of impact and transformation from our program beneficiaries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl overflow-hidden shadow-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  {story.video && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/30 group hover:bg-black/40 transition-colors">
                      <Play className="h-12 w-12 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-4">{story.description}</p>

                  <blockquote className="border-l-4 border-gray-200 pl-4 mb-4">
                    <p className="text-gray-600 italic">"{story.quote}"</p>
                  </blockquote>

                  <div className="flex items-center">
                    <Quote className={`h-8 w-8 ${categoryColors[category]} p-1.5 rounded-full mr-3`} />
                    <div>
                      <p className="font-medium">{story.author}</p>
                      <p className="text-sm text-gray-500">{story.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramSuccessStories;
