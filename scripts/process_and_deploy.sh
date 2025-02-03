#!/bin/bash

# Process the reservations
echo "Processing reservations..."
python backend/process_reservations.py

# Check if processing was successful
if [ $? -eq 0 ]; then
    echo "Successfully processed reservations"
    
    # Copy to frontend if needed
    echo "Ensuring frontend data directory exists..."
    mkdir -p frontend/public/data
    
    # Start the frontend
    echo "Starting frontend..."
    cd frontend && npm start
else
    echo "Error processing reservations"
    exit 1
fi 