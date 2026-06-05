Param(
  [string]$SourceDir,
  [string]$OutDir
)

if (-not $SourceDir) {
  $SourceDir = Join-Path (Resolve-Path "$PSScriptRoot\..") 'portable_build'
}
if (-not $OutDir) {
  $OutDir = Join-Path (Resolve-Path "$PSScriptRoot\..") 'dist'
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$ZipPath = Join-Path $OutDir 'bible100_portable_clean.zip'
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }

Compress-Archive -Path (Join-Path $SourceDir '*') -DestinationPath $ZipPath -Force
Write-Host ("ZIP created: {0}" -f $ZipPath)

