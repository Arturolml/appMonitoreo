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

# Create subfolder structure to match the path /appmonitoreo
# This ensures that 'serve' delivers the files correctly when accessed via the subpath
RUN mkdir -p /app/serve_dir/appmonitoreo && \
    cp -r /app/dist/* /app/serve_dir/appmonitoreo/

EXPOSE 80

# Serve from the parent directory so /appmonitoreo route works
# -s handles SPA routing
CMD ["serve", "-s", "serve_dir", "-l", "80"]
