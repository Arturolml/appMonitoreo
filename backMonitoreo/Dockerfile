FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source code and prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

EXPOSE 3009

# For dev you might want npm run start:dev, but for compose we'll use a script 
# to ensure migrations are run
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
