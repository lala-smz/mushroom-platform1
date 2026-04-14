Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory of the current VBScript file
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Check if backend service is running
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcesses = objWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE CommandLine LIKE '%backend-node%npm start%'")

If colProcesses.Count = 0 Then
    ' Start backend service in hidden window
    strBackendCmd = "cmd /c cd /d """ & strScriptDir & "\backend-node"" && npm start"
    objShell.Run strBackendCmd, 0, False
    ' Wait for backend to start
    WScript.Sleep 3000
End If

' Check if frontend service is running
Set colProcesses = objWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE CommandLine LIKE '%frontend-vue3%npm run dev%'")

If colProcesses.Count = 0 Then
    ' Start frontend service in hidden window
    strFrontendCmd = "cmd /c cd /d """ & strScriptDir & "\frontend-vue3"" && npm run dev"
    objShell.Run strFrontendCmd, 0, False
    ' Wait for frontend to start
    WScript.Sleep 3000
End If

' Wait a bit more for services to be ready
WScript.Sleep 2000

' Check which port frontend is running on
Dim frontendPort
frontendPort = "5174"

' Use netstat to check ports
Set objShellExec = objShell.Exec("netstat -ano | findstr :5174")
strOutput = objShellExec.StdOut.ReadAll
If InStr(strOutput, "LISTENING") = 0 Then
    ' Check port 5175
    Set objShellExec = objShell.Exec("netstat -ano | findstr :5175")
    strOutput = objShellExec.StdOut.ReadAll
    If InStr(strOutput, "LISTENING") > 0 Then
        frontendPort = "5175"
    End If
End If

' Open browser to login page
objShell.Run "http://localhost:" & frontendPort & "/login", 1, False

WScript.Quit