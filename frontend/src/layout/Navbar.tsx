// src/layout/Navbar.tsx - Updated to fix purple text issue
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { NavbarProps } from './types';

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className={`bg-gray-800 dark:bg-dark-nav shadow-md ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-lg font-bold text-white">ExpenseLogger</span>
            </Link>
          </div>
          
          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/dashboard') || isActive('/') 
                  ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            <Link 
              to="/invoices" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/invoices') 
                  ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoices
            </Link>
            <Link 
              to="/expenses" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/expenses') 
                  ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Expenses
            </Link>
            <Link 
              to="/tools" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/tools') 
                  ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tools
            </Link>
          </div>
          
          {/* Right-side actions */}
          <div className="flex items-center">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Profile/Login Button */}
            <div className="ml-4">
              <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 dark:bg-dark-nav">
          <Link 
            to="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/dashboard') || isActive('/') 
                ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/invoices" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/invoices') 
                ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Invoices
          </Link>
          <Link 
            to="/expenses" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/expenses') 
                ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Expenses
          </Link>
          <Link 
            to="/tools" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/tools') 
                ? 'bg-gray-900 text-white dark:bg-gray-700 dark:text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Tools
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;