' Bible100 - one double-click: local server + browser (no command window for beginners)
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
bat = dir & "\run_bible100_local.bat"
If Not fso.FileExists(bat) Then
  bat = dir & "\run_bible_track_local.bat"
End If
If Not fso.FileExists(bat) Then
  MsgBox "找不到 run_bible100_local.bat", vbCritical, "Bible100"
  WScript.Quit 1
End If
sh.Run """" & bat & """", 1, False
