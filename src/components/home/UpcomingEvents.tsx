import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, Calendar, MapPin } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Community Health Workshop',
    date: '2024-12-20',
    time: '10:00 AM',
    location: 'Hope Center Main Hall',
    category: 'Health',
    attendees: 45,
    description: 'Join us for an interactive workshop on community health and wellness.',
    image: '/images/events/health-workshop.jpg'
  },
  {
    id: 2,
    title: 'Youth Leadership Summit',
    date: '2024-12-25',
    time: '2:00 PM',
    location: 'Community Center',
    category: 'Education',
    attendees: 60,
    description: 'Empowering young leaders to make a difference in their communities.',
    image: '/images/events/youth-summit.jpg'
  },
  {
    id: 3,
    title: 'Charity Fundraising Gala',
    date: '2024-12-30',
    time: '6:00 PM',
    location: 'Grand Ballroom',
    category: 'Fundraising',
    attendees: 120,
    description: 'An elegant evening of giving back to support our community initiatives.',
    image: '/images/events/fundraising-gala.jpg'
  },
  {
    id: 4,
    title: 'Environmental Clean-up Drive',
    date: '2025-01-05',
    time: '9:00 AM',
    location: 'City Park',
    category: 'Environment',
    attendees: 80,
    description: 'Help us make our community cleaner and greener.',
    image: '/images/events/cleanup-drive.jpg'
  }
];

const UpcomingEvents = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 2;
  const totalPages = Math.ceil(events.length / eventsPerPage);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalPages]);

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentEvents = events.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {currentEvents.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative h-[400px]"
              >
                <div className="absolute inset-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-rose-600/90 text-white rounded-full text-sm">
                      {event.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-200 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 text-sm text-gray-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} Attendees</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors duration-300"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentPage === index ? 'bg-rose-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;