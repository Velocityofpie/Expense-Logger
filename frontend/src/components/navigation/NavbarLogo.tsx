// src/components/navigation/NavbarLogo.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarLogoProps {
  title: string;
  icon: React.ReactNode;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ title, icon }) => {
  return (
    <div className="flex-shrink-0">
      <Link to="/" className="flex items-center">
        {icon}
        <span className="ml-2 text-white font-bold text-lg">{title}</span>
      </Link>
    </div>
  );
};

export default NavbarLogo;
