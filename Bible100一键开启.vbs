' 隐藏窗口启动 打开Bible100.bat（用户心智：开 Bible100 / index）
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c """ & sh.CurrentDirectory & "\打开Bible100.bat""", 0, False
