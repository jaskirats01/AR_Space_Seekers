@echo off
echo Starting Spacecraft AI Detector...
echo.

echo Starting Python Backend Server...
start "Python Backend" cmd /k "python api/detect.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Next.js Frontend Server...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo.
echo Press any key to exit this launcher...
pause > nul 