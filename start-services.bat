@echo off
REM Start services in the background and keep them running
echo Starting services in background...

REM Set the project root directory
cd /d "%~dp0"

REM Check if backend directory exists
if not exist "backend-node" (
    echo Error: backend-node directory not found!
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend-vue3" (
    echo Error: frontend-vue3 directory not found!
    pause
    exit /b 1
)

REM Start backend service in a new window
echo Starting backend service...
start "Backend Service" cmd /k "cd backend-node && if not exist node_modules (echo Installing dependencies... && npm install) && npm start"

REM Start frontend service in a new window
echo Starting frontend service...
start "Frontend Service" cmd /k "cd frontend-vue3 && npm run dev"

echo Services started!
echo Backend: http://localhost:3003
echo Frontend: http://localhost:5174

echo Services are running in the background.
echo You can now click the desktop icon to open the login page.
pause