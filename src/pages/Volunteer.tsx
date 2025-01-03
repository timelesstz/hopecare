import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Search, Filter, ChevronDown, CheckCircle2, User, Bell, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import VolunteerDashboard from '../components/volunteer/VolunteerDashboard';
import VolunteerOpportunities from '../components/volunteer/VolunteerOpportunities';
import AdminEditButton from '../components/AdminEditButton';

const Volunteer = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'opportunities'>('opportunities');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminEditButton pageId="volunteer" />
      
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveView('opportunities')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeView === 'opportunities'
                      ? 'border-rose-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Opportunities
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeView === 'dashboard'
                        ? 'border-rose-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    My Dashboard
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Bell className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoggedIn(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-4">Make a Difference Today</h1>
            <p className="text-lg mb-6">
              Join our community of volunteers and help create positive change in healthcare access.
            </p>
            {!isLoggedIn && (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-rose-600 bg-white hover:bg-rose-50"
              >
                <User className="h-5 w-5 mr-2" />
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Dashboard or Opportunities */}
        {activeView === 'dashboard' && isLoggedIn ? (
          <VolunteerDashboard />
        ) : (
          <VolunteerOpportunities />
        )}
      </main>
    </div>
  );
};

export default Volunteer;