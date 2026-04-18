Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory of the current VBScript file
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Run the batch file with absolute path
objShell.Run Chr(34) & strScriptDir & "\check-services.bat" & Chr(34), 0, False
WScript.Quit