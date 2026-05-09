Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Make sure we are in the exact same folder as this script
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

' Start the backend server invisibly
WshShell.Run "cmd /c cd backend && npm run dev", 0, False

' Start the frontend server invisibly
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False

' Wait 10 seconds for Next.js to start up properly before tunneling
WScript.Sleep 10000

' Start LocalTunnel to make it public invisibly
' Added -y to bypass npx installation prompts
WshShell.Run "cmd /c npx -y localtunnel --port 3000 --subdomain skgroups-erp", 0, False

MsgBox "SK GROUPS ERP is now starting in the background!" & vbCrLf & vbCrLf & "Please wait about 20-30 seconds for the servers to fully boot up." & vbCrLf & vbCrLf & "The public website will be live at:" & vbCrLf & "https://skgroups-erp.loca.lt" & vbCrLf & vbCrLf & "IMPORTANT: When you first open the link, you may see a 'Bypass' page. Just click 'Click to Continue' or enter your public IP if prompted." & vbCrLf & vbCrLf & "To stop the website later, run 'stop-background.bat'.", 64, "SK GROUPS Deployment"
