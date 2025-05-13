import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Image, 
  BarChart3, 
  Settings, 
  Calendar, 
  DollarSign, 
  Heart, 
  Shield, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  isActive: boolean;
  hasSubMenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  title, 
  path, 
  isActive, 
  hasSubMenu = false,
  isOpen = false,
  onClick 
}) => {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm rounded-lg mb-1 transition-all ${
        isActive 
          ? 'bg-rose-100 text-rose-700 font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <span className={`mr-3 ${isActive ? 'text-rose-600' : 'text-gray-500'}`}>
            {icon}
          </span>
          <span>{title}</span>
        </div>
        {hasSubMenu && (
          <span className="text-gray-400">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>
    </NavLink>
  );
};

interface AdminSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isMobile = false,
  isOpen = true,
  onClose
}) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [contentSubmenuOpen, setContentSubmenuOpen] = useState(false);
  const [userSubmenuOpen, setUserSubmenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }
  };

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <motion.div
          initial={isMobile ? "closed" : "open"}
          animate="open"
          exit="closed"
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
          className={`${
            isMobile 
              ? 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl' 
              : 'sticky top-0 h-screen w-64 bg-white shadow-sm'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-rose-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">HopeCare Admin</h2>
            </div>
            {isMobile && (
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-4">
                Main
              </p>
              <SidebarItem
                icon={<LayoutDashboard size={18} />}
                title="Dashboard"
                path="/admin/dashboard"
                isActive={isActive('/admin/dashboard')}
              />
              
              <div className="mb-2">
                <SidebarItem
                  icon={<FileText size={18} />}
                  title="Content Management"
                  path="/admin/content"
                  isActive={isActive('/admin/content')}
                  hasSubMenu={true}
                  isOpen={contentSubmenuOpen}
                  onClick={() => setContentSubmenuOpen(!contentSubmenuOpen)}
                />
                
                {contentSubmenuOpen && (
                  <div className="ml-6 space-y-1 mt-1">
                    <SidebarItem
                      icon={<FileText size={16} />}
                      title="Pages"
                      path="/admin/content/pages"
                      isActive={isActive('/admin/content/pages')}
                    />
                    <SidebarItem
                      icon={<FileText size={16} />}
                      title="Blog Posts"
                      path="/admin/content/posts"
                      isActive={isActive('/admin/content/posts')}
                    />
                  </div>
                )}
              </div>
              
              <SidebarItem
                icon={<Image size={18} />}
                title="Media Library"
                path="/admin/media"
                isActive={isActive('/admin/media')}
              />
              
              <div className="mb-2">
                <SidebarItem
                  icon={<Users size={18} />}
                  title="User Management"
                  path="/admin/users"
                  isActive={isActive('/admin/users')}
                  hasSubMenu={true}
                  isOpen={userSubmenuOpen}
                  onClick={() => setUserSubmenuOpen(!userSubmenuOpen)}
                />
                
                {userSubmenuOpen && (
                  <div className="ml-6 space-y-1 mt-1">
                    <SidebarItem
                      icon={<Shield size={16} />}
                      title="Admins"
                      path="/admin/users/admins"
                      isActive={isActive('/admin/users/admins')}
                    />
                    <SidebarItem
                      icon={<Heart size={16} />}
                      title="Volunteers"
                      path="/admin/users/volunteers"
                      isActive={isActive('/admin/users/volunteers')}
                    />
                    <SidebarItem
                      icon={<DollarSign size={16} />}
                      title="Donors"
                      path="/admin/users/donors"
                      isActive={isActive('/admin/users/donors')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-4">
                Operations
              </p>
              <SidebarItem
                icon={<DollarSign size={18} />}
                title="Donations"
                path="/admin/donations"
                isActive={isActive('/admin/donations')}
              />
              <SidebarItem
                icon={<Calendar size={18} />}
                title="Events"
                path="/admin/events"
                isActive={isActive('/admin/events')}
              />
              <SidebarItem
                icon={<BarChart3 size={18} />}
                title="Analytics"
                path="/admin/analytics"
                isActive={isActive('/admin/analytics')}
              />
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-4">
                System
              </p>
              <SidebarItem
                icon={<Settings size={18} />}
                title="Settings"
                path="/admin/settings"
                isActive={isActive('/admin/settings')}
              />
            </div>

            {/* Logout Button */}
            <div className="mt-auto pt-6 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} className="mr-3 text-gray-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;