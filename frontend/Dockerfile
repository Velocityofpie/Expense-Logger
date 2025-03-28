# Build stage
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with forced resolutions
RUN npm install --legacy-peer-deps
# Fix the specific dependency issue
RUN npm install ajv@8.11.0 ajv-keywords@5.1.0 --legacy-peer-deps

# Copy source code
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json tsconfig.paths.json postcss.config.js tailwind.config.js ./

# Create index.tsx if it doesn't exist
RUN if [ ! -f ./src/index.tsx ]; then \
    echo '// src/index.tsx\n\
import React from "react";\n\
import { createRoot } from "react-dom/client";\n\
import "./styles/global.css";\n\
import App from "./App";\n\
\n\
const container = document.getElementById("root");\n\
if (!container) throw new Error("Failed to find the root element");\n\
const root = createRoot(container);\n\
\n\
root.render(\n\
  <React.StrictMode>\n\
    <App />\n\
  </React.StrictMode>\n\
);' > ./src/index.tsx; \
fi

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create docker-entrypoint.sh file
RUN echo '#!/bin/sh\n\
# Replace env vars in JavaScript files\n\
echo "Replacing environment variables..."\n\
for file in /usr/share/nginx/html/static/js/*.js; do\n\
  echo "Processing $file ..."\n\
  sed -i "s|%REACT_APP_API_URL%|${REACT_APP_API_URL}|g" $file\n\
  sed -i "s|%REACT_APP_ENV%|${REACT_APP_ENV}|g" $file\n\
done\n\
\n\
echo "Starting Nginx..."\n\
exec nginx -g "daemon off;"\n\
' > /docker-entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]