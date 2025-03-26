# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if necessary
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Add environment variable handling with script
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create docker-entrypoint.sh script to replace env variables at runtime
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

# Expose port 80
EXPOSE 80

# Start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]