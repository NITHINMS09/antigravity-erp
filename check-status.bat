@echo off
echo ========================================================
echo       SK GROUPS ERP - SYSTEM STATUS CHECK
echo ========================================================
echo.

echo Checking Frontend (Port 3000)...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is running.
) else (
    echo [ERROR] Frontend is NOT running on port 3000.
)

echo.
echo Checking Backend (Port 5000)...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running.
) else (
    echo [ERROR] Backend is NOT running on port 5000.
)

echo.
echo Checking Public Tunnel (LocalTunnel)...
tasklist /FI "IMAGENAME eq node.exe" | findstr node.exe > nul
if %errorlevel% equ 0 (
    echo [OK] Tunnel process (node) is active.
) else (
    echo [WARNING] No tunnel process found. Site might not be public.
)

echo.
echo --------------------------------------------------------
echo If you see "Bad Gateway" or the link doesn't load:
echo 1. Run stop-everything.bat
echo 2. Try running start-everything.bat again.
echo 3. Ensure you typed 'yes' in the Pinggy tunnel window.
echo --------------------------------------------------------
echo.
pause
