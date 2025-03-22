// src/App.tsx
import React from "react";
import Router from "./routes/Router";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <div className="min-h-screen transition-colors duration-200 dark:bg-dark-bg">
            <Router />
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;