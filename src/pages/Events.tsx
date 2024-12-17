import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Search, Share2, Bell, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  description: string;
  category: 'health' | 'education' | 'economic' | 'community';
  image: string;
  maxAttendees?: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All Events', color: 'gray' },
  { id: 'health', label: 'Health', color: 'green' },
  { id: 'education', label: 'Education', color: 'blue' },
  { id: 'economic', label: 'Economic', color: 'yellow' },
  { id: 'community', label: 'Community', color: 'purple' }
];

const Events = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [reminderEvents, setReminderEvents] = useState<number[]>([]);

  const events = [
    {
      id: 1,
      title: 'Community Health Workshop',
      date: '2024-12-15',
      time: '10:00 AM',
      location: 'Community Center',
      attendees: 45,
      maxAttendees: 50,
      description: 'Join us for a comprehensive health workshop focusing on preventive care and wellness.',
      category: 'health',
      image: '/images/events/health-workshop.jpg'
    },
    {
      id: 2,
      title: 'Education Fundraising Gala',
      date: '2024-12-17',
      time: '6:00 PM',
      location: 'Safari Hotel Grand Ballroom',
      attendees: 120,
      maxAttendees: 150,
      description: 'Annual fundraising event to support our education programs in rural communities.',
      category: 'education',
      image: '/images/events/education-gala.jpg'
    },
    {
      id: 3,
      title: 'Youth Entrepreneurship Workshop',
      date: '2024-12-24',
      time: '2:00 PM',
      location: 'Business Innovation Hub',
      attendees: 75,
      maxAttendees: 100,
      description: 'Learn essential business skills and meet successful entrepreneurs from our community.',
      category: 'economic',
      image: '/images/events/youth-workshop.jpg'
    },
    {
      id: 4,
      title: 'New Year Community Celebration',
      date: '2024-12-31',
      time: '7:00 PM',
      location: 'City Park',
      attendees: 200,
      maxAttendees: 300,
      description: 'Join us for a festive celebration of our community achievements in 2024.',
      category: 'community',
      image: '/images/events/community-celebration.jpg'
    }
  ] as Event[];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))));
  };

  const getEventForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(event => event.date === dateStr);
  };

  const handleRegister = (event: Event) => {
    if (registeredEvents.includes(event.id)) {
      setRegisteredEvents(prev => prev.filter(id => id !== event.id));
      toast.success('Event registration cancelled');
    } else {
      setRegisteredEvents(prev => [...prev, event.id]);
      toast.success('Successfully registered for event!');
    }
  };

  const toggleReminder = (event: Event) => {
    if (reminderEvents.includes(event.id)) {
      setReminderEvents(prev => prev.filter(id => id !== event.id));
      toast.success('Reminder removed');
    } else {
      setReminderEvents(prev => [...prev, event.id]);
      toast.success('Reminder set for this event');
    }
  };

  const handleShare = async (event: Event) => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } catch (error) {
      toast.error('Unable to share event');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
        <p className="text-lg text-gray-600">Join us in making a difference in our community</p>
      </motion.div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-800 border-${category.color}-200`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                } border`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-rose-600 text-white p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">
                  {currentMonth.toLocaleString('default', { month: 'long' })}
                </h2>
                <div className="text-2xl font-light">
                  {currentMonth.getFullYear()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-rose-500 rounded-lg transition-colors"
                >
                  <motion.span
                    whileHover={{ x: -3 }}
                    className="inline-block"
                  >
                    ←
                  </motion.span>
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-rose-500 rounded-lg transition-colors"
                >
                  <motion.span
                    whileHover={{ x: 3 }}
                    className="inline-block"
                  >
                    →
                  </motion.span>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-500 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startOfMonth(currentMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1;
                  const event = getEventForDate(day);
                  const isToday = currentMonth.getMonth() === new Date().getMonth() &&
                                currentMonth.getFullYear() === new Date().getFullYear() &&
                                day === new Date().getDate();
                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: event ? 1.05 : 1 }}
                      className={`
                        relative aspect-square flex flex-col items-center justify-center
                        rounded-xl cursor-pointer border transition-all duration-200
                        ${event ? 'hover:border-rose-500 hover:shadow-md' : 'hover:bg-gray-50'}
                        ${isToday ? 'bg-rose-50 border-rose-500 font-bold' : 'border-gray-100'}
                      `}
                      onClick={() => event && setSelectedEvent(event)}
                    >
                      <span className={`
                        text-sm z-10 relative
                        ${event ? 'text-rose-600 font-semibold' : ''}
                        ${isToday ? 'text-rose-600' : ''}
                      `}>
                        {day}
                      </span>
                      {event && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-2 rounded-lg bg-rose-100/50"
                        />
                      )}
                      {event && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="px-6 pb-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Event Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-rose-500" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedEvent?.id || 'empty'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {selectedEvent ? (
              <div>
                {/* Event Image Header */}
                <div className="relative h-48">
                  <div className="absolute inset-0">
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleReminder(selectedEvent)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        reminderEvents.includes(selectedEvent.id)
                          ? 'bg-yellow-500/90 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShare(selectedEvent)}
                      className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-md transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md
                      ${selectedEvent.category === 'health' ? 'bg-green-500/90 text-white' :
                        selectedEvent.category === 'education' ? 'bg-blue-500/90 text-white' :
                        selectedEvent.category === 'economic' ? 'bg-yellow-500/90 text-white' :
                        'bg-purple-500/90 text-white'}`}
                    >
                      {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Event Details Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
                  
                  {/* Event Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-gray-500 text-sm mb-1">Attendees</div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedEvent.attendees}
                        </span>
                        <span className="text-gray-500 text-sm mb-1">
                          / {selectedEvent.maxAttendees}
                        </span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-gray-500 text-sm mb-1">Date & Time</div>
                      <div className="text-gray-900">
                        <div className="font-medium">
                          {new Date(selectedEvent.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-rose-600 font-medium">{selectedEvent.time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Location</div>
                        <div className="text-gray-500">{selectedEvent.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRegister(selectedEvent)}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                        registeredEvents.includes(selectedEvent.id)
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {registeredEvents.includes(selectedEvent.id)
                        ? 'Cancel Registration'
                        : 'Register for Event'}
                    </motion.button>
                    <div className="text-center text-sm text-gray-500">
                      {registeredEvents.includes(selectedEvent.id)
                        ? 'You are registered for this event'
                        : `${selectedEvent.maxAttendees - selectedEvent.attendees} spots remaining`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-500 p-6">
                <Calendar className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Event Selected</h3>
                <p className="text-center">
                  Select an event from the calendar or the list below to view its details
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upcoming Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-semibold mb-6">All Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleReminder(event)}
                    className={`p-2 rounded-full ${
                      reminderEvents.includes(event.id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-gray-600'
                    } shadow-lg hover:scale-105 transition-transform`}
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${event.category === 'health' ? 'bg-green-100 text-green-800' :
                      event.category === 'education' ? 'bg-blue-100 text-blue-800' :
                      event.category === 'economic' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'}`}
                  >
                    {event.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.attendees}/{event.maxAttendees} attendees</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleRegister(event)}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                      registeredEvents.includes(event.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {registeredEvents.includes(event.id) ? 'Cancel' : 'Register'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Events;