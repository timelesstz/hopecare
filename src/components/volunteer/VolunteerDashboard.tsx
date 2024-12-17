import { useState } from 'react';
import { BarChart2, Calendar, Clock, Settings, Award, Users } from 'lucide-react';
import VolunteerStats from './VolunteerStats';
import UpcomingEvents from './UpcomingEvents';
import VolunteerSchedule from './VolunteerSchedule';
import VolunteerProfile from './VolunteerProfile';
import VolunteerCertifications from './VolunteerCertifications';
import VolunteerTeam from './VolunteerTeam';
import VolunteerSettings from './VolunteerSettings';
import VolunteerAchievements from './VolunteerAchievements';
import { mockVolunteer } from '../../data/mockData';

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'team', label: 'My Team', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Summary */}
      <div className="mb-8">
        <VolunteerProfile volunteer={mockVolunteer} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <nav className="flex space-x-8 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <>
            <VolunteerStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UpcomingEvents />
              <VolunteerSchedule />
            </div>
            <VolunteerAchievements />
          </>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow">
            <VolunteerSchedule expanded />
          </div>
        )}

        {activeTab === 'team' && (
          <VolunteerTeam />
        )}

        {activeTab === 'achievements' && (
          <>
            <VolunteerStats />
            <VolunteerAchievements />
          </>
        )}

        {activeTab === 'settings' && (
          <VolunteerSettings volunteer={mockVolunteer} />
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;