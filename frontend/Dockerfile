# Build stage
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all project files
COPY . .

# Set environment variables for production build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:8000}
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config directly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Use the default CMD from the nginx image