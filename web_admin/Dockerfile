# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy build artifacts from previous stage
COPY --from=build /app/dist ./dist

EXPOSE 80

# Serve directly from the 'dist' folder.
# The external Nginx proxy will handle the /appmonitoreo path routing.
# -s handles SPA routing
CMD ["serve", "-s", "dist", "-l", "80"]
