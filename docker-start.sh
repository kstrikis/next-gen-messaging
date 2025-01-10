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

# Start both services using the dev script
echo "Starting services..."
npm run dev 