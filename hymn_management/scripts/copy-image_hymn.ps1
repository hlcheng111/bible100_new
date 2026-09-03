# 只拷貝樂譜圖 image_hymn（約 493MB）
$Source = "C:\bible100_new\hymn_management\hymn\image_hymn"
$Dest   = Join-Path $PSScriptRoot "..\hymn\image_hymn"
if (-not (Test-Path -LiteralPath $Source)) {
  Write-Error "找不到來源：$Source"
}
New-Item -ItemType Directory -Path $Dest -Force | Out-Null
robocopy $Source $Dest /E /XO /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) { exit 1 }
Write-Host "OK image_hymn -> $Dest"
