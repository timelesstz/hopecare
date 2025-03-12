import { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Calendar, 
  Users, 
  Settings, 
  Loader, 
  Award, 
  Clock, 
  BarChart2, 
  Bell,
  Heart,
  MessageSquare,
  CheckCircle2,
  Menu
} from 'lucide-react';
import VolunteerProfile from '../components/volunteer/VolunteerProfile';
import VolunteerTeam from '../components/volunteer/VolunteerTeam';
import VolunteerSettings from '../components/volunteer/VolunteerSettings';
import VolunteerOpportunities from '../components/volunteer/VolunteerOpportunities';
import VolunteerSidebar from '../components/volunteer/VolunteerSidebar';
import { useAuth } from '../hooks/useAuth';
import { useVolunteerData } from '../hooks/useVolunteerData';
import { Alert, AlertTitle, Badge, LinearProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Volunteer } from '../types/volunteer';

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, loading: authLoading } = useAuth();
  const { volunteer, opportunities, teams, loading: dataLoading, error, refreshData } = useVolunteerData();
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-rose-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Create a default volunteer if none exists
  const defaultVolunteer: Volunteer = {
    id: user?.uid || 'temp-id',
    firstName: user?.displayName?.split(' ')[0] || 'Volunteer',
    lastName: user?.displayName?.split(' ')[1] || 'User',
    email: user?.email || 'volunteer@example.com',
    phone: '+1234567890',
    skills: ['Communication', 'Organization'],
    languages: ['English'],
    availability: {
      weekdays: true,
      weekends: false,
      evenings: false
    },
    hoursLogged: 0,
    eventsAttended: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Use the volunteer from the hook or the default one
  const displayVolunteer = volunteer || defaultVolunteer;

  if (error) {
    console.error('Volunteer data error:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert severity="warning" sx={{ maxWidth: '800px', mx: 'auto', mt: 4 }}>
          <AlertTitle>Data Loading Issue</AlertTitle>
          {error}
          <p className="mt-2">We'll use a default profile for now.</p>
        </Alert>
        <div className="container mx-auto px-4 py-8 mt-8">
          <div className="flex space-x-4 mb-8">
            {/* Use the VolunteerSidebar component */}
            <VolunteerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {activeTab === 'overview' && (
            <>
              <VolunteerProfile volunteer={displayVolunteer} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <VolunteerOpportunities opportunities={opportunities} />
              </div>
            </>
          )}

          {activeTab === 'opportunities' && <VolunteerOpportunities opportunities={opportunities} />}
          {activeTab === 'team' && <VolunteerTeam teams={teams} />}
          {activeTab === 'settings' && <VolunteerSettings volunteer={displayVolunteer} refreshData={refreshData} />}
        </div>
      </div>
    );
  }

  // Calculate upcoming events
  const upcomingEvents = opportunities.filter(opp => 
    new Date(opp.date) > new Date() && 
    new Date(opp.date) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  );

  // Volunteer stats
  const volunteerStats = [
    { label: "Hours Contributed", value: displayVolunteer.hoursLogged?.toString() || "0", icon: Clock },
    { label: "Events Attended", value: displayVolunteer.eventsAttended?.toString() || "0", icon: CheckCircle2 },
    { label: "Skills", value: displayVolunteer.skills?.length.toString() || "0", icon: Award },
  ];

  // Recent activities
  const recentActivities = [
    { 
      id: '1', 
      type: 'event', 
      title: 'Community Garden Project', 
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: 'You volunteered for 3 hours'
    },
    { 
      id: '2', 
      type: 'team', 
      title: 'Education Team', 
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: 'You joined a new team'
    },
    { 
      id: '3', 
      type: 'skill', 
      title: 'Teaching', 
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: 'You added a new skill'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Use the VolunteerSidebar component */}
      <VolunteerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center md:hidden">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-semibold text-gray-900">Volunteer Dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${displayVolunteer.firstName}+${displayVolunteer.lastName}&background=be123c&color=fff`}
                    alt={`${displayVolunteer.firstName} ${displayVolunteer.lastName}`}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                    {displayVolunteer.firstName} {displayVolunteer.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Volunteer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {volunteerStats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="bg-rose-100 p-3 rounded-full">
                          <StatIcon className="h-6 w-6 text-rose-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volunteer Profile */}
              <VolunteerProfile volunteer={displayVolunteer} />

              {/* Upcoming Opportunities */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Opportunities</h3>
                  <button
                    className="text-sm font-medium text-rose-600 hover:text-rose-500"
                    onClick={() => setActiveTab('opportunities')}
                  >
                    View All
                  </button>
                </div>
                <div className="p-6">
                  <VolunteerOpportunities opportunities={upcomingEvents.length > 0 ? upcomingEvents : opportunities.slice(0, 2)} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-rose-100 p-2 rounded-full">
                          {activity.type === 'event' && <Calendar className="h-5 w-5 text-rose-600" />}
                          {activity.type === 'team' && <Users className="h-5 w-5 text-rose-600" />}
                          {activity.type === 'skill' && <Award className="h-5 w-5 text-rose-600" />}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && <VolunteerOpportunities opportunities={opportunities} />}
          {activeTab === 'team' && <VolunteerTeam teams={teams} />}
          {activeTab === 'settings' && <VolunteerSettings volunteer={displayVolunteer} refreshData={refreshData} />}
        </main>
      </div>
    </div>
  );
};

export default VolunteerDashboard;