# 总站本机 HTTP（repo 根 serve，默认 8080）
param(
  [int]$Port = 8080,
  [string]$RepoRoot = ""
)

if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  $RepoRoot = Split-Path -Parent $RepoRoot
}

Set-Location $RepoRoot

$listening = netstat -ano 2>$null | Select-String ":$Port " | Select-String "LISTENING"
if ($listening) {
  Write-Host "[OK] 端口 $Port 已有服务" -ForegroundColor Green
  exit 0
}

Write-Host "[启动] npx serve . -l $Port （总站 HTTP）…" -ForegroundColor Cyan
Start-Process -WindowStyle Minimized -FilePath "cmd.exe" -ArgumentList @(
  "/c", "cd /d `"$RepoRoot`" && npx --yes serve . -l $Port"
)
exit 0
