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

# Go back to app root and start services
cd /app
echo "Starting services..."
exec npm run start 