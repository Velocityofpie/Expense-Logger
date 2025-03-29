// src/utils/config.ts

// Define the shape of the runtime configuration
interface RuntimeConfig {
    apiUrl: string;
  }
  
  // Access the global runtime config that's injected by the container
  declare global {
    interface Window {
      RUNTIME_CONFIG?: RuntimeConfig;
    }
  }
  
  // Function to get configuration with fallbacks
  export const getConfig = (): RuntimeConfig => {
    // First try runtime config (from config.js injected at container startup)
    const runtimeConfig = window.RUNTIME_CONFIG;
    
    // Then try environment variables from build time
    const buildTimeApiUrl = process.env.REACT_APP_API_URL;
    
    // Finally use defaults
    return {
      apiUrl: runtimeConfig?.apiUrl || buildTimeApiUrl || 'http://localhost:8000',
    };
  };
  
  // Export individual config properties for convenience
  export const apiUrl = getConfig().apiUrl;
  
  export default getConfig;