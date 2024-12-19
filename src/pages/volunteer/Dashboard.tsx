import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VolunteerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Community Health Workshop',
      date: '2024-01-15',
      location: 'Arusha Community Center',
      program: 'Health'
    },
    {
      id: 2,
      title: 'Education Support Program',
      date: '2024-01-20',
      location: 'Local Primary School',
      program: 'Education'
    },
    {
      id: 3,
      title: 'Business Skills Training',
      date: '2024-01-25',
      location: 'HopeCare Training Center',
      program: 'Economic Empowerment'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Welcome,</span>
                <span className="ml-1 font-medium text-gray-900">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏰</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Hours Volunteered</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">48</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Events Participated</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">12</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">People Impacted</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">156</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🌟</div>
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-medium text-gray-500">Achievement Points</div>
                    <div className="mt-1 text-3xl font-semibold text-gray-900">850</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Browse All Events
              </button>
            </div>
            <div className="mt-4 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Date: {event.date}</p>
                      <p>Location: {event.location}</p>
                      <p>Program: {event.program}</p>
                    </div>
                    <div className="mt-4">
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Schedule */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Your Schedule</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="prose max-w-none">
                <p className="text-gray-500">Your upcoming volunteer schedule:</p>
                <ul className="mt-4 space-y-4">
                  <li className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <span className="text-primary text-sm font-medium">15</span>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Community Health Workshop</p>
                      <p className="text-sm text-gray-500">Jan 15, 2024 • 9:00 AM - 12:00 PM</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <span className="text-primary text-sm font-medium">20</span>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Education Support Program</p>
                      <p className="text-sm text-gray-500">Jan 20, 2024 • 2:00 PM - 5:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
