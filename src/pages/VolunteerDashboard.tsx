import { useState } from 'react';
import { UserCircle, Calendar, Users, Settings } from 'lucide-react';
import VolunteerProfile from '../components/volunteer/VolunteerProfile';
import VolunteerTeam from '../components/volunteer/VolunteerTeam';
import VolunteerSettings from '../components/volunteer/VolunteerSettings';
import VolunteerOpportunities from '../components/volunteer/VolunteerOpportunities';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useFirebaseAuth();

  const mockVolunteer = {
    id: user?.id || '',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: 'Volunteer',
    status: 'Active',
    impactScore: 85,
    joinDate: '2024-01-01',
    skills: ['First Aid', 'Event Planning', 'Teaching'],
    languages: ['English', 'Spanish'],
    availability: {
      weekdays: true,
      weekends: true,
      evenings: false
    }
  };

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: UserCircle
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      icon: Calendar
    },
    {
      id: 'team',
      name: 'Team',
      icon: Users
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex space-x-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <VolunteerProfile volunteer={mockVolunteer} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <VolunteerOpportunities />
          </div>
        </>
      )}

      {activeTab === 'opportunities' && <VolunteerOpportunities />}
      {activeTab === 'team' && <VolunteerTeam />}
      {activeTab === 'settings' && <VolunteerSettings />}
    </div>
  );
};

export default VolunteerDashboard;