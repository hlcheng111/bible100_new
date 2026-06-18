' 聖經跑道 · 小白一鍵開啟（雙擊此檔，無需看命令列）
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
bat = dir & "\打開聖經跑道.bat"
If Not fso.FileExists(bat) Then
  MsgBox "找不到打開聖經跑道.bat", vbCritical, "聖經跑道"
  WScript.Quit 1
End If
sh.Run """" & bat & """", 1, False
