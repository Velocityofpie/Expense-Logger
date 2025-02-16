# Use an official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (to leverage Docker caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Ensure node_modules exists
RUN ls -la node_modules || npm install

# Expose React port
EXPOSE 3000

# Start React app
CMD ["npm", "start"]
