@echo off
REM Start Mushroom Project
echo Starting Mushroom Project...

REM Set the project root directory
echo Current directory: %CD%
echo Batch file directory: %~dp0

REM Change to the batch file directory
cd /d "%~dp0"
echo Changed to: %CD%

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

REM Start backend and frontend services in parallel
echo Starting backend service...
start "Backend Service" cmd /k "cd /d "%~dp0" && cd backend-node && if not exist node_modules (echo Installing dependencies... && npm install) && npm start"

echo Starting frontend service...
start "Frontend Service" cmd /k "cd /d "%~dp0" && cd frontend-vue3 && npm run dev"

REM Wait a short time for frontend to start (it's fast!)
echo Waiting for services to start...
ping 127.0.0.1 -n 5 > nul

REM Open browser to login page on port 5174
echo Opening browser to login page...
start http://localhost:5174/login

echo Project started!
echo Backend service running at http://localhost:3003
echo Frontend service running at http://localhost:5174
echo Browser opened to http://localhost:5174/login

REM Don't pause, just exit
exit