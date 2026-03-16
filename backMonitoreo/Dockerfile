# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install

# Copy source and prisma
COPY . .

# Generate Prisma client and Build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts and prisma from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

EXPOSE 3009

# Entry point script to run migrations and then the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
