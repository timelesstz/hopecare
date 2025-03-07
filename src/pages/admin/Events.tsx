import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { Calendar, Plus, Edit2, Trash2, AlertCircle, Clock, MapPin, Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { safeFirestoreOperation, isMissingCollectionError } from '../../utils/firestoreRetry';
import { logFirestoreError } from '../../utils/firestoreErrorHandler';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  capacity: number;
  registered: number;
  created_at: any;
  updated_at: any;
  image_url?: string;
  tags?: string[];
}

const EventsPage: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    organizer: '',
    status: 'upcoming',
    capacity: 50,
    registered: 0,
    image_url: '',
    tags: ''
  });
  const [collectionExists, setCollectionExists] = useState<boolean>(true);
  const [creatingCollection, setCreatingCollection] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has admin permissions
    if (user && user.role === 'ADMIN') {
      const checkCollection = async () => {
        const exists = await checkEventsCollectionExists();
        setCollectionExists(exists);
        if (exists) {
          fetchEvents();
        } else {
          setError('Events collection does not exist. Create it to manage events.');
        }
      };
      
      checkCollection();
    } else {
      setError('You do not have permission to access this page');
      toast.error('Access denied. Admin permissions required.');
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await safeFirestoreOperation(
        async () => {
          const eventsQuery = query(
            collection(db, 'events'),
            orderBy('created_at', 'desc')
          );
          
          const eventsSnapshot = await getDocs(eventsQuery);
          
          const eventsList: Event[] = [];
          eventsSnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              eventsList.push({
                id: doc.id,
                title: data.title || 'Untitled Event',
                description: data.description || '',
                date: data.date || new Date(),
                location: data.location || 'TBD',
                organizer: data.organizer || 'HopeCare',
                status: data.status || 'upcoming',
                capacity: data.capacity || 0,
                registered: data.registered || 0,
                created_at: data.created_at,
                updated_at: data.updated_at,
                image_url: data.image_url || '',
                tags: data.tags || []
              });
            } catch (docError) {
              logFirestoreError(docError, `events-processing-doc-${doc.id}`);
              // Continue processing other documents
            }
          });
          
          return eventsList;
        },
        'Failed to fetch events. Please try again later.',
        'events-fetch'
      );
      
      if (!result) {
        // The operation failed and error was already handled by safeFirestoreOperation
        setError('Failed to fetch events');
        return;
      }
      
      setEvents(result);
    } catch (err) {
      // This catch is for any errors not caught by safeFirestoreOperation
      logFirestoreError(err, 'events-fetch-outer');
      
      // Special handling for missing collection errors
      if (isMissingCollectionError(err)) {
        setError('Failed to fetch events. The events collection might not exist.');
        
        // Create a button to redirect to dashboard to create the collection
        toast.error(
          <div>
            Events collection might not exist. 
            <button 
              onClick={() => window.location.href = '/admin/dashboard'} 
              className="ml-2 underline text-blue-600"
            >
              Go to Dashboard
            </button>
          </div>,
          { duration: 5000 }
        );
        return;
      }
      
      // Special handling for missing index errors
      if (err instanceof Error && err.message.includes('requires an index')) {
        const indexUrl = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
        if (indexUrl) {
          setError(
            <>
              This query requires a Firestore index. Please{' '}
              <a 
                href={indexUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                click here
              </a>{' '}
              to create it.
            </>
          );
          toast.error(
            <div>
              Missing Firestore index. 
              <a 
                href={indexUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 underline text-blue-600"
              >
                Create it here
              </a>
            </div>,
            { duration: 10000 }
          );
          return;
        }
      }
      
      setError('An unexpected error occurred while fetching events');
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await safeFirestoreOperation(
      async () => {
        const eventData = {
          title: newEvent.title,
          description: newEvent.description,
          date: new Date(newEvent.date),
          location: newEvent.location,
          organizer: newEvent.organizer || user?.name || 'Admin',
          status: newEvent.status,
          capacity: Number(newEvent.capacity),
          registered: Number(newEvent.registered),
          image_url: newEvent.image_url || 'https://source.unsplash.com/random/800x600/?event',
          tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()) : [],
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'events'), eventData);
        return docRef;
      },
      'Failed to add event. Please try again.',
      'events-add'
    );
    
    if (result) {
      toast.success('Event added successfully!');
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        organizer: user?.name || '',
        status: 'upcoming',
        capacity: 0,
        registered: 0,
        image_url: '',
        tags: ''
      });
      fetchEvents();
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, {
          title: editingEvent.title,
          description: editingEvent.description,
          date: new Date(editingEvent.date as string),
          location: editingEvent.location,
          organizer: editingEvent.organizer,
          status: editingEvent.status,
          capacity: Number(editingEvent.capacity),
          registered: Number(editingEvent.registered),
          image_url: editingEvent.image_url,
          tags: typeof editingEvent.tags === 'string' 
            ? editingEvent.tags.split(',').map(tag => tag.trim()) 
            : editingEvent.tags,
          updated_at: serverTimestamp()
        });
        return true;
      },
      'Failed to update event. Please try again.',
      'events-update'
    );
    
    if (result) {
      toast.success('Event updated successfully!');
      setEditingEvent(null);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const result = await safeFirestoreOperation(
      async () => {
        await deleteDoc(doc(db, 'events', id));
        return true;
      },
      'Failed to delete event. Please try again.',
      'events-delete'
    );
    
    if (result) {
      toast.success('Event deleted successfully!');
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.organizer.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date: Date | string) => {
    if (!date) return 'No date';
    if (typeof date === 'string') return date;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if events collection exists
  const checkEventsCollectionExists = async (): Promise<boolean> => {
    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(query(eventsRef, limit(1)));
      return true;
    } catch (error) {
      console.error('Error checking events collection:', error);
      return false;
    }
  };
  
  // Create events collection
  const createEventsCollection = async () => {
    try {
      setCreatingCollection(true);
      
      const eventsRef = collection(db, 'events');
      const sampleEvent = {
        title: 'Welcome to HopeCare Events',
        description: 'This is a sample event to help you get started with the events feature.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
        location: 'HopeCare Community Center',
        organizer: 'HopeCare Team',
        status: 'upcoming',
        capacity: 50,
        registered: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        image_url: '',
        tags: ['sample', 'welcome']
      };
      
      await addDoc(eventsRef, sampleEvent);
      
      toast.success('Events collection created successfully!');
      setCollectionExists(true);
      fetchEvents();
    } catch (error) {
      console.error('Error creating events collection:', error);
      toast.error('Failed to create events collection');
    } finally {
      setCreatingCollection(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
        <button
          onClick={() => setShowAddEvent(true)}
          className="px-4 py-2 bg-rose-600 text-white rounded-md flex items-center hover:bg-rose-700 transition-colors"
          disabled={!collectionExists}
        >
          <Plus size={16} className="mr-2" />
          Add New Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {!collectionExists ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium">Events collection does not exist</p>
          </div>
          <p className="text-sm mt-2 mb-3">
            The events collection does not exist in your database. You need to create it to manage events.
          </p>
          <div className="flex justify-end">
            <button
              onClick={createEventsCollection}
              disabled={creatingCollection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingCollection ? 'Creating...' : 'Create Events Collection'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {loading && !showAddEvent && !editingEvent ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md mb-6 text-center">
              <Calendar size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-gray-500 mt-1">Create your first event to get started</p>
              <button
                onClick={() => setShowAddEvent(true)}
                className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md inline-flex items-center hover:bg-rose-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add New Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
                  {event.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <Clock size={14} className="mr-1" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Users size={14} className="mr-1" />
                      <span>{event.registered} / {event.capacity} registered</span>
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Array.isArray(event.tags) ? event.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        )) : null}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Event Modal */}
          {showAddEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Add New Event</h2>
                <form onSubmit={handleAddEvent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                      <input
                        type="text"
                        value={newEvent.organizer}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder={user?.name || 'Admin'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newEvent.status}
                        onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={newEvent.image_url}
                        onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newEvent.tags}
                        onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="community, outreach, education"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {editingEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit Event</h2>
                <form onSubmit={handleUpdateEvent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={typeof editingEvent.date === 'object' 
                          ? new Date(editingEvent.date.getTime() - (editingEvent.date.getTimezoneOffset() * 60000))
                              .toISOString()
                              .slice(0, 16)
                          : editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editingEvent.location}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                      <input
                        type="text"
                        value={editingEvent.organizer}
                        onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingEvent.status}
                        onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={editingEvent.capacity}
                        onChange={(e) => setEditingEvent({ ...editingEvent, capacity: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editingEvent.image_url || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingEvent.tags) ? editingEvent.tags.join(', ') : editingEvent.tags || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, tags: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage; 