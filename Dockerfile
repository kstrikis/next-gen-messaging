FROM node:22-bullseye AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build client
RUN cd client && npm run build

# Production stage
FROM node:22-bullseye-slim

WORKDIR /app

# Install netcat for container health check
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy built client and server
COPY --from=builder /app .

# Install production dependencies only
ENV NODE_ENV=production
RUN npm install -g concurrently nodemon && npm install --omit=dev
RUN cd client && npm install --omit=dev
RUN cd server && npm install --omit=dev

# Generate Prisma client in production
RUN cd server && npx prisma generate

# Expose ports
EXPOSE 3000 3001

# Add start script
COPY docker-start.sh /docker-start.sh
RUN chmod +x /docker-start.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -z localhost 3001 || exit 1

CMD ["/docker-start.sh"] 