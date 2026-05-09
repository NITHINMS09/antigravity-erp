@echo off
echo ========================================================
echo       SK GROUPS ERP - PUBLIC INTERNET ACCESS
echo ========================================================
echo.
echo Make sure your frontend (npm run dev) and backend are already running!
echo.
echo Generating a secure public URL for your application...
echo This might take a few seconds.
echo.
echo Please copy the URL below and share it with your team.
echo Do not close this window as long as you want the site to remain public.
echo.
echo NOTE: When you first open the link, you may see a "Bypass" page.
echo Just click "Click to Continue" or enter your public IP if prompted.
echo.
npx -y localtunnel --port 3000 --subdomain skgroups-erp
pause
