# Use Node.js 18 LTS on Alpine (lightweight)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]
