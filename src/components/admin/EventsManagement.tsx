import { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import EventForm from './EventForm';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Community Clean-up Day",
      date: "2024-03-20",
      time: "09:00 AM",
      location: "Central Park",
      capacity: 50,
      registered: 32,
      status: "upcoming",
      description: "Join us for a community clean-up event to help maintain our local park.",
      organizer: "Environmental Team",
      contactEmail: "environment@hopecare.org",
      contactPhone: "(555) 123-4567"
    },
    {
      id: 2,
      title: "Fundraising Gala",
      date: "2024-03-25",
      time: "06:00 PM",
      location: "Grand Hotel",
      capacity: 200,
      registered: 175,
      status: "upcoming",
      description: "Annual fundraising gala to support our healthcare initiatives.",
      organizer: "Events Committee",
      contactEmail: "events@hopecare.org",
      contactPhone: "(555) 987-6543"
    }
  ]);

  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEvent = (data: Omit<Event, 'id' | 'registered'>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newEvent = {
        ...data,
        id: events.length + 1,
        registered: 0
      };
      setEvents([...events, newEvent]);
      setShowEventForm(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleUpdateEvent = (data: Omit<Event, 'id' | 'registered'>) => {
    if (!selectedEvent) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedEvents = events.map(event =>
        event.id === selectedEvent.id
          ? { ...event, ...data }
          : event
      );
      setEvents(updatedEvents);
      setShowEventForm(false);
      setSelectedEvent(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const filteredEvents = events
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(event => statusFilter === 'all' || event.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
        <button 
          onClick={() => {
            setSelectedEvent(null);
            setShowEventForm(true);
          }}
          className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <select 
              className="ml-4 border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{event.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.date} at {event.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {event.registered}/{event.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventForm(true);
                        }}
                        className="text-rose-600 hover:text-rose-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEventForm && (
        <EventForm
          event={selectedEvent || undefined}
          onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default EventsManagement;