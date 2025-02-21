# frontend/Dockerfile

FROM node:16

# Create app directory
WORKDIR /app

# Copy package.json/package-lock.json first, then install
COPY package*.json ./
RUN npm install

# Copy the rest of your frontend source
COPY . /app

# Expose port 3000
EXPOSE 3000

# Default command
CMD ["npm", "start"]

