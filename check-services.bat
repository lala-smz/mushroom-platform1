@echo off
REM Check if services are running and start them if not
echo Checking services...

REM Check if backend service is running
netstat -ano | findstr :3003 > nul
if %errorlevel% equ 0 (
    echo Backend service is already running on port 3003
) else (
    echo Backend service is not running, starting it...
    REM Start backend service in hidden window
    start /b "Backend Service" cmd /c "cd /d "%~dp0" && cd backend-node && if not exist node_modules (echo Installing dependencies... && npm install) && npm start"
    echo Waiting for backend to start...
    ping 127.0.0.1 -n 5 > nul
)

REM Check if frontend service is running
netstat -ano | findstr :5174 > nul
if %errorlevel% equ 0 (
    echo Frontend service is already running on port 5174
) else (
    echo Frontend service is not running, starting it...
    REM Start frontend service in hidden window
    start /b "Frontend Service" cmd /c "cd /d "%~dp0" && cd frontend-vue3 && npm run dev"
    echo Waiting for frontend to start...
    ping 127.0.0.1 -n 3 > nul
)

REM Open browser to login page
echo Opening browser to login page...
start http://localhost:5174/login

echo Done!
echo You can now use the application.

REM Exit immediately without pause
exit