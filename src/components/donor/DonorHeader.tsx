import React, { useState } from 'react';
import { Menu, Bell, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Donor } from '../../types/donor';
import { Badge, Avatar, Menu as MuiMenu, MenuItem, IconButton, Drawer } from '@mui/material';
import DonorSidebar from './DonorSidebar';

interface DonorHeaderProps {
  donor: Donor;
}

const DonorHeader: React.FC<DonorHeaderProps> = ({ donor }) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const notifications = [
    { id: 1, message: 'Your donation to Education for All was received', time: '2 hours ago' },
    { id: 2, message: 'New project: Healthcare Initiative launched', time: '1 day ago' },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-semibold text-gray-900">Donor Dashboard</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/donate"
              className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Donate Now
            </Link>
            <div className="ml-4 flex items-center md:ml-6">
              <IconButton
                aria-label="show notifications"
                color="inherit"
                onClick={handleNotificationsOpen}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <Bell className="h-6 w-6 text-gray-400" />
                </Badge>
              </IconButton>
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#be123c',
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}
                    >
                      {donor.firstName && donor.lastName 
                        ? `${donor.firstName[0]}${donor.lastName[0]}`
                        : <User className="h-5 w-5" />
                      }
                    </Avatar>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile dropdown */}
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className="px-4 py-3">
          <p className="text-sm">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {donor.email}
          </p>
        </div>
        <MenuItem onClick={handleMenuClose}>Your Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
      </MuiMenu>

      {/* Notifications dropdown */}
      <MuiMenu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">Notifications</p>
        </div>
        {notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={handleNotificationsClose} sx={{ whiteSpace: 'normal' }}>
            <div className="py-1">
              <p className="text-sm text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </MenuItem>
        ))}
        <div className="px-4 py-2 border-t border-gray-200">
          <Link 
            to="#" 
            className="text-sm font-medium text-rose-600 hover:text-rose-500"
            onClick={handleNotificationsClose}
          >
            View all notifications
          </Link>
        </div>
      </MuiMenu>
    </header>
  );
};

export default DonorHeader; 