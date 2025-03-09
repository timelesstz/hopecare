import React from 'react';
import { NavLink } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

interface AdminSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isMobile = false, 
  isOpen = false,
  onClose
}) => {
  const { user } = useFirebaseAuth();
  
  const sidebarClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`
    : 'w-64 bg-gray-800 h-full';
    
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/content', label: 'Content', icon: '📝' },
    { path: '/admin/media', label: 'Media', icon: '🖼️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/donations', label: 'Donations', icon: '💰' },
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className={sidebarClass}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-6 bg-gray-900">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          {isMobile && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 text-sm rounded-md ${
                      isActive 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User info */}
        <div className="px-4 py-4 bg-gray-900">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
              {user?.displayName?.[0] || user?.email?.[0] || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.displayName || user?.email || 'Admin User'}
              </p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 