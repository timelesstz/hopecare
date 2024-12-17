import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}

const TestimonialControls: React.FC<TestimonialControlsProps> = ({
  currentIndex,
  totalCount,
  onPrev,
  onNext
}) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={onPrev}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        <button
          onClick={onNext}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>
      
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalCount }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-rose-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialControls;