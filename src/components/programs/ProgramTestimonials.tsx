import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from '../common/Image';
import TestimonialControls from './testimonials/TestimonialControls';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  image: string;
}

interface ProgramTestimonialsProps {
  testimonials: Testimonial[];
}

const ProgramTestimonials: React.FC<ProgramTestimonialsProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="mt-4 text-lg text-gray-600">
            Hear from those who have benefited from our programs
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].author}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonials[currentIndex].author}</h3>
                      <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonials[currentIndex].quote}"</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <TestimonialControls
            currentIndex={currentIndex}
            totalCount={testimonials.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramTestimonials;