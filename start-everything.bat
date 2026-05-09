@echo off
echo ========================================================
echo       SK GROUPS ERP - STARTUP MANAGER
echo ========================================================
echo.
echo Starting the ERP system...
echo Two new windows will open for:
echo   1. Backend Server
echo   2. Frontend Server
echo.
echo Please leave these windows open to keep the site running locally.
echo.

:: Start Backend in a new window
start "SK GROUPS Backend (Port 5000)" cmd /k "cd backend && echo Starting Backend... && npm run dev"

:: Start Frontend in a new window
start "SK GROUPS Frontend (Port 3000)" cmd /k "cd frontend && echo Starting Frontend... && npm run dev"

echo.
echo ========================================================
echo Servers are launching!
echo To make the website public, please run:
echo host-public.bat
echo ========================================================
echo.
pause
