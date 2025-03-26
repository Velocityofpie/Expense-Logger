// frontend/src/layout/Footer.tsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FooterProps } from './types';

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { darkMode } = useContext(ThemeContext);
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-gray-900 dark:text-dark-text-primary font-bold text-lg">Expense Logger</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Track your expenses, manage invoices, and get insights into your spending habits.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/invoices" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Invoices
                </Link>
              </li>
              <li>
                <Link to="/expenses" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Expenses
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Tools
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 dark:text-dark-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary tracking-wider uppercase mb-4">
              Contact
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
              Have questions or feedback? Reach out to us!
            </p>
            <a 
              href="mailto:support@expense-logger.com" 
              className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@expense-logger.com
            </a>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              &copy; {currentYear} Expense Logger. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;