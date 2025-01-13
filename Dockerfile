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

ENV NEXT_TELEMETRY_DISABLED=1
ENV ESLINT_SKIP=true

# Copy source code
COPY . .

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

# Expose ports
EXPOSE 3000 3001

# Add start script
COPY scripts/docker-start.sh /scripts/docker-start.sh
RUN chmod +x /scripts/docker-start.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -z localhost 3001 || exit 1

CMD ["/scripts/docker-start.sh"] 