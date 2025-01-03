import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  image
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
          <img
            src={image}
            alt={author}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <Quote className="h-8 w-8 text-rose-600 mb-4" />
          <blockquote className="text-xl text-gray-900 italic mb-6">
            {quote}
          </blockquote>
          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-gray-600">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;