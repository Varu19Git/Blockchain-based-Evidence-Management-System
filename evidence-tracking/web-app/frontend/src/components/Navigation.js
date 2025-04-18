import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasRole } = useAuth();

  // Define navigation items based on auth status and roles
  const getNavigationItems = () => {
    // Public navigation when not logged in
    if (!currentUser) {
      return [
        { name: 'Login', href: '/login' },
        { name: 'Register', href: '/register' },
      ];
    }

    // Base navigation items for authenticated users
    const items = [
      { name: 'Dashboard', href: '/' },
      { name: 'Evidence Records', href: '/evidence' },
    ];

    // Add role-specific items
    if (hasRole('admin') || hasRole('officer')) {
      items.push({ name: 'Submit Evidence', href: '/submit' });
    }

    if (hasRole('admin')) {
      items.push(
        { name: 'Verification', href: '/verification' },
        { name: 'Reports', href: '/reports' }
      );
    }

    return items;
  };

  const navigation = getNavigationItems();

  const isCurrentPath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    return path !== '/' && location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.firstName) return 'U';
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName ? currentUser.lastName.charAt(0) : ''}`;
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">Evidence Tracker</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isCurrentPath(item.href)
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
                    }`}
                    aria-current={isCurrentPath(item.href) ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Theme Switcher */}
              <div className="mr-4">
                <ThemeSwitcher />
              </div>
              
              {currentUser && (
                <>
                  <button
                    type="button"
                    className="bg-indigo-600 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>

                  {/* Profile dropdown */}
                  <div className="ml-3 relative">
                    <div>
                      <button
                        type="button"
                        className="max-w-xs bg-indigo-600 rounded-full flex items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                        id="user-menu-button"
                        aria-expanded={profileDropdownOpen}
                        aria-haspopup="true"
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      >
                        <span className="sr-only">Open user menu</span>
                        <span className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium">
                          {getUserInitials()}
                        </span>
                      </button>
                    </div>
                    
                    {/* Dropdown menu */}
                    {profileDropdownOpen && (
                      <div 
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isCurrentPath(item.href)
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-500 hover:text-white'
              }`}
              aria-current={isCurrentPath(item.href) ? 'page' : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Theme Switcher */}
          <div className="px-3 py-2">
            <ThemeSwitcher />
          </div>
        </div>
        
        {currentUser && (
          <div className="pt-4 pb-3 border-t border-indigo-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <span className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="text-sm font-medium text-indigo-300">
                  {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                className="ml-auto bg-indigo-600 flex-shrink-0 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
              >
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-white hover:bg-indigo-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-white hover:bg-indigo-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-white hover:bg-indigo-500"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 