// src/types/styled.d.ts
import 'tailwindcss/tailwind.css';

// This file contains TypeScript declarations for modules without types

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Environment variables
interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  REACT_APP_API_URL: string;
  // Add other environment variables here
}

// Extend Window interface for custom properties
interface Window {
  env?: {
    API_URL?: string;
    // Other runtime environment variables
  };
}