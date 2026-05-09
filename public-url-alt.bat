@echo off
echo ========================================================
echo       SK GROUPS ERP - STABLE PUBLIC URL (PINGGY)
echo ========================================================
echo.
echo This is a more stable alternative to LocalTunnel.
echo.
echo 1. Make sure your servers are running (npm run dev).
echo 2. If prompted "Are you sure you want to continue connecting?", type "yes".
echo 3. Look for the URL ending in .pinggy.link
echo.
ssh -p 443 -R0:localhost:3000 -L443:pinggy.io:443 a.pinggy.io
pause
