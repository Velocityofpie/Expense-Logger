# Build stage
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a simple entrypoint script for environment variable substitution
RUN echo '#!/bin/sh\n\
# Replace env vars in JavaScript files\n\
for file in /usr/share/nginx/html/static/js/*.js; do\n\
  sed -i "s|%REACT_APP_API_URL%|${REACT_APP_API_URL}|g" $file\n\
  sed -i "s|%REACT_APP_ENV%|${REACT_APP_ENV}|g" $file\n\
done\n\
\n\
exec nginx -g "daemon off;"\n\
' > /docker-entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]