param(
  [Parameter(Mandatory = $true)][string]$Url
)
$chromePaths = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$edgePaths = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
)
foreach ($p in $chromePaths) {
  if (Test-Path $p) {
    Start-Process -FilePath $p -ArgumentList @("--app=$Url")
    exit 0
  }
}
foreach ($p in $edgePaths) {
  if (Test-Path $p) {
    Start-Process -FilePath $p -ArgumentList @("--app=$Url")
    exit 0
  }
}
Start-Process $Url
exit 0
