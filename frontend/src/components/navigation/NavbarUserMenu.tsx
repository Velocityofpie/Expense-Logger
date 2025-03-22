// src/components/navigation/NavbarUserMenu.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface UserMenuLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavbarUserMenuProps {
  isAuthenticated: boolean;
  username?: string;
  onLogout: () => void;
  links: UserMenuLink[];
}

const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({ 
  isAuthenticated, 
  username = 'User', 
  onLogout, 
  links 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <div className="ml-3 relative">
      {isAuthenticated ? (
        <>
          <div>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="max-w-xs bg-gray-800 dark:bg-gray-700 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              id="user-menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                {username.charAt(0)}
              </div>
              <span className="ml-2 text-white">{username}</span>
            </button>
          </div>
          
          {isProfileOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              {links.map((link, index) => (
                <Link 
                  key={index}
                  to={link.to} 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <span className="inline-block mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={onLogout} // This will act as a login button when not authenticated
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Log in
        </button>
      )}
    </div>
  );
};

export default NavbarUserMenu;