#!/bin/sh

# Start the server in the background
cd /app/server && npm start &

# Start the client
cd /app/client && npm start 