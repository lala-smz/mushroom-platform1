Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory of the current VBScript file
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Start backend service in hidden window
objShell.Run Chr(34) & strScriptDir & "\backend-node\node_modules\.bin\npm.cmd" & Chr(34) & " start", 0, False

' Wait for backend to start
WScript.Sleep 3000

' Start frontend service in hidden window
objShell.Run Chr(34) & strScriptDir & "\frontend-vue3\node_modules\.bin\npm.cmd" & Chr(34) & " run dev", 0, False

' Wait for frontend to start
WScript.Sleep 2000

' Open browser to login page
objShell.Run "http://localhost:5174/login", 1, False

WScript.Quit