#!/bin/sh

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

# Start the server in the background
echo "Starting server..."
npm start &
SERVER_PID=$!

# Start the client
cd /app/client
echo "Starting client..."
npm start &
CLIENT_PID=$!

# Handle process termination
trap 'kill $SERVER_PID $CLIENT_PID' SIGTERM SIGINT

# Wait for either process to exit
wait -n $SERVER_PID $CLIENT_PID
exit $? 