@echo off
setlocal
echo ========================================================
echo       SK GROUPS ERP - PUBLIC HOSTING MANAGER
echo ========================================================
echo.
echo Make sure your backend and frontend are already running!
echo (You should have used start-everything.bat or npm run dev)
echo.
echo Choose a hosting method:
echo 1. Localhost.run (Recommended, fast, no installation)
echo 2. LocalTunnel (Requires installation, sometimes buggy)
echo 3. Pinggy (Alternative SSH tunnel)
echo.

set /p choice="Enter a number (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting Localhost.run...
    echo Look for the URL starting with https and ending in lhr.life
    echo.
    ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
    pause
    exit /b
)

if "%choice%"=="2" (
    echo.
    echo Starting LocalTunnel...
    echo Note: If asked to install, say yes. If it gives Bad Gateway, try method 1.
    echo.
    npx -y localtunnel --port 3000 --subdomain skgroups-erp-%RANDOM%
    pause
    exit /b
)

if "%choice%"=="3" (
    echo.
    echo Starting Pinggy...
    echo Note: If asked 'Are you sure you want to continue connecting?', type 'yes'.
    echo Look for the URL ending in pinggy.link
    echo.
    ssh -o StrictHostKeyChecking=no -p 443 -R0:localhost:3000 a.pinggy.io
    pause
    exit /b
)

echo Invalid choice. Please run the script again.
pause
