#!/bin/bash

echo "Starting Spacecraft AI Detector..."
echo

echo "Starting Python Backend Server..."
python api/detect.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting Next.js Frontend Server..."
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 