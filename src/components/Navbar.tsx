import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Heart, LogIn, UserCircle, Home, BookOpen, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useFirebaseAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, [location.pathname]);

  const mainNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About', path: '/about', icon: BookOpen },
    {
      label: 'Programs',
      path: '/programs',
      icon: ChevronRight,
      children: [
        { label: 'Education', path: '/programs/education' },
        { label: 'Health', path: '/programs/health' },
        { label: 'Economic Empowerment', path: '/programs/economic-empowerment' }
      ]
    },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Blog', path: '/blog', icon: BookOpen },
    { label: 'Contact', path: '/contact', icon: MessageSquare }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const itemVariants = {
    closed: {
      x: -16,
      opacity: 0
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1
      }
    })
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                src="logos/logo.png"
                alt="HopeCare"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {mainNavItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <>
                    <button
                      className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-rose-600 font-medium rounded-lg group transition-colors duration-200"
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                      {item.label}
                      <ChevronDown className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2 px-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.path}
                            className="block px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-gray-700 hover:text-rose-600 font-medium rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path ? 'text-rose-600' : ''
                    }`}
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Desktop Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/donate"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors duration-200"
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-rose-600 font-medium rounded-lg transition-colors duration-200">
                    <UserCircle className="h-6 w-6 mr-2" />
                    {user.role}
                    <ChevronDown className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2 px-1">
                      <Link
                        to={`/${user.role.toLowerCase()}-dashboard`}
                        className="block px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <button className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-rose-600 font-medium rounded-lg transition-colors duration-200">
                    <LogIn className="h-6 w-6 mr-2" />
                    Login
                    <ChevronDown className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2 px-1">
                      <Link
                        to="/donor-login"
                        className="block px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      >
                        <Heart className="inline h-4 w-4 mr-2" />
                        Donor Login
                      </Link>
                      <Link
                        to="/volunteer-login"
                        className="block px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      >
                        <UserCircle className="inline h-4 w-4 mr-2" />
                        Volunteer Login
                      </Link>
                      <Link
                        to="/admin/login"
                        className="block px-4 py-3 text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      >
                        <LogIn className="inline h-4 w-4 mr-2" />
                        Admin Login
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-gray-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6 text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden bg-white border-b shadow-lg overflow-hidden"
          >
            <div className="px-4 py-2 space-y-2">
              {/* User Info Section */}
              {user && (
                <motion.div
                  variants={itemVariants}
                  custom={0}
                  className="bg-gray-50 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-rose-100 rounded-full p-2">
                      <UserCircle className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Welcome back!
                      </div>
                      <div className="text-xs text-gray-500">
                        Logged in as {user.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Items */}
              {mainNavItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  custom={index + 1}
                >
                  {item.children ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            {item.icon && <item.icon className="h-5 w-5 text-gray-600" />}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: activeSubmenu === item.label ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {activeSubmenu === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-12 space-y-1"
                          >
                            {item.children.map((child, childIndex) => (
                              <motion.div
                                key={child.label}
                                variants={itemVariants}
                                custom={childIndex}
                              >
                                <Link
                                  to={child.path}
                                  className="block p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="bg-gray-100 rounded-full p-2">
                        {item.icon && <item.icon className="h-5 w-5 text-gray-600" />}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                custom={mainNavItems.length + 1}
                className="pt-2"
              >
                <Link
                  to="/donate"
                  className="flex items-center justify-center space-x-2 w-full p-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">Donate Now</span>
                </Link>
              </motion.div>

              {/* Login/Logout Section */}
              <motion.div
                variants={itemVariants}
                custom={mainNavItems.length + 2}
                className="border-t border-gray-100 pt-2"
              >
                {user ? (
                  <div className="flex items-center justify-between p-3">
                    <Link
                      to={`/${user.role.toLowerCase()}-dashboard`}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500 px-3">
                      Login Options
                    </div>
                    {[
                      { label: 'Donor Login', path: '/donor-login', icon: Heart },
                      { label: 'Volunteer Login', path: '/volunteer-login', icon: UserCircle },
                      { label: 'Admin Login', path: '/admin/login', icon: LogIn }
                    ].map((option, index) => (
                      <Link
                        key={option.label}
                        to={option.path}
                        className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="bg-gray-100 rounded-full p-2">
                          <option.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;