FROM node:22-bullseye AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:22-bullseye-slim

WORKDIR /app

# Copy built client and server
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/client/next.config.js ./client/
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Install production dependencies only
ENV NODE_ENV=production
RUN npm run install:all --omit=dev

# Expose ports
EXPOSE 3000 3001

# Add start script
COPY docker-start.sh /docker-start.sh
RUN chmod +x /docker-start.sh

CMD ["/docker-start.sh"] 