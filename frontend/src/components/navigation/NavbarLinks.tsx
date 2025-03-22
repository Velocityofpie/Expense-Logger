// src/components/navigation/NavbarLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavbarLinksProps {
  links: NavLink[];
}

const NavbarLinks: React.FC<NavbarLinksProps> = ({ links }) => {
  const location = useLocation();

  // Check if the route is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        {links.map((link, index) => (
          <Link 
            key={index}
            to={link.to}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              isActive(link.to) 
              ? 'bg-gray-900 text-white dark:bg-gray-700' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="h-4 w-4 mr-1.5 inline-block flex-shrink-0">
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavbarLinks;
