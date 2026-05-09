@echo off
echo ========================================================
echo       SK GROUPS ERP - STOP EVERYTHING
echo ========================================================
echo.
echo Stopping all SK GROUPS servers (Node.js) and Tunnels (SSH)...
echo This will close your server windows.
echo.
taskkill /F /IM node.exe
taskkill /F /IM ssh.exe
echo.
echo All processes stopped successfully!
echo The public website is now offline.
echo.
pause
