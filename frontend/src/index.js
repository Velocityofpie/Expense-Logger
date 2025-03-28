// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";

// Import Bootstrap CSS first
import 'bootstrap/dist/css/bootstrap.min.css';

// Then import Tailwind (via global.css)
import "./styles/global.css";

// Import specific icon fixes
import "./styles/icons.css";

// Import Bootstrap dark mode overrides
import "./styles/bootstrap-dark.css";

// Import navigation-specific styles
import "./styles/navigation.css";

// Import Dashboard specific styles
import "./styles/dashboard-cards.css";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);