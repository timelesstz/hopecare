import React from 'react';
import { UserCircle, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface VolunteerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const VolunteerSidebar: React.FC<VolunteerSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: UserCircle },
    { id: 'opportunities', label: 'Opportunities', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <div className="h-8 w-8 bg-rose-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
            HC
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">HopeCare</span>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === tab.id
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      activeTab === tab.id ? 'text-rose-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex-shrink-0 group block w-full flex items-center text-gray-600 hover:text-gray-900"
          >
            <div className="flex items-center">
              <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium">Logout</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerSidebar; 