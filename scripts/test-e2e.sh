#!/bin/bash

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$DIR/.."

# Function to cleanup processes
cleanup() {
    echo "Cleaning up..."
    # Kill any process running on port 3001
    if lsof -ti:3001 > /dev/null; then
        echo "Killing process on port 3001..."
        lsof -ti:3001 | xargs kill -9
    fi
    # Kill the server if it's running
    if [ ! -z "$SERVER_PID" ]; then
        echo "Killing server process $SERVER_PID..."
        kill -9 $SERVER_PID 2>/dev/null || true
    fi
}

# Set up trap to ensure cleanup happens on script exit
trap cleanup EXIT INT TERM

# Kill any existing process on port 3001
cleanup

echo "Starting server..."
# Start the server in the background with test environment
cd "$PROJECT_ROOT/server" && NODE_ENV=test npm run dev &
SERVER_PID=$!

# Wait for server to be ready by polling the health endpoint
echo "Waiting for server to start..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "Server is ready!"
        break
    fi
    echo "Attempt $attempt of $max_attempts..."
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "Server failed to start within $max_attempts seconds"
    exit 1
fi

# Run Cypress tests
cd "$PROJECT_ROOT" && NODE_ENV=test npx cypress run

# Store the exit code
EXIT_CODE=$?

# Exit with the test exit code
exit $EXIT_CODE 