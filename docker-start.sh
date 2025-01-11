#!/bin/bash

# Exit on error
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run database migrations
cd /app/server
echo "Running database migrations..."
npx prisma migrate deploy

# Go back to app root
cd /app

# Start both services in production mode
echo "Starting services..."
if [ "$NODE_ENV" = "production" ]; then
  # Build Next.js client
  echo "Building Next.js client..."
  cd client && npm run build
  
  # Start Next.js in production mode
  echo "Starting Next.js..."
  PORT=3000 npm run start & 
  
  # Start Express server in production mode
  echo "Starting Express server..."
  cd ../server && PORT=3001 npm run start &
  
  # Wait for both processes
  wait
else
  # Use dev mode for development
  npm run dev
fi 