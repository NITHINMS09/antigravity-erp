@echo off
echo ========================================================
echo       SK GROUPS ERP - STOP BACKGROUND SERVERS
echo ========================================================
echo.
echo Stopping all running SK GROUPS background processes...
taskkill /F /IM node.exe
echo.
echo All background processes stopped successfully!
echo The public website is now offline.
echo.
pause
