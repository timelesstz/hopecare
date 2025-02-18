import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "The impact HopeCare has made in our community is immeasurable. They've helped transform lives through their education programs.",
    author: "Sarah M.",
    role: "Community Leader",
    image: "testimonials/sarah.jpeg"
  },
  {
    id: 2,
    quote: "Thanks to HopeCare's support, we've been able to start our own small business and provide for our families.",
    author: "Michael T.",
    role: "Program Beneficiary",
    image: "testimonials/michael.jpeg"
  },
  {
    id: 3,
    quote: "Volunteering with HopeCare has been an incredible journey of growth and impact. The team's dedication is inspiring.",
    author: "Emily R.",
    role: "Volunteer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80"
  }
];

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-rose-600 rounded-full p-4">
              <Quote className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="pt-8">
            <div className="relative overflow-hidden">
              <div
                className={`flex transition-transform duration-500 ease-in-out ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4 md:px-8"
                  >
                    <div className="text-center">
                      <p className="text-xl md:text-2xl text-gray-600 mb-8 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center justify-center mb-4">
                        <img
                          src={testimonial.image}
                          alt={testimonial.author}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-rose-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between pointer-events-none">
              <button
                onClick={handlePrev}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={handleNext}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;