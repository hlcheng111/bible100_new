# Build zip for PC/USB/phone copy — open index.html (no localhost).
# Usage:
#   .\scripts\build_phone_package.ps1              # Slim (~試用)
#   .\scripts\build_phone_package.ps1 -Profile Full # 含 languages/cn + 模組（較大）

param(
    [ValidateSet('Slim', 'HostingSlim', 'Full')]
    [string]$Profile = 'Slim'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmm'
$OutName = "bible100_${Profile}_$Timestamp.zip"
$OutPath = Join-Path $Root $OutName
$Temp = Join-Path $env:TEMP "bible100_pack_$Timestamp"
if (Test-Path $Temp) { Remove-Item $Temp -Recurse -Force }
New-Item -ItemType Directory -Path $Temp -Force | Out-Null

$Always = @(
    'index.html', 'index_v5.html', 'index_legacy.html',
    'manifest.json', 'service-worker.js',
    'README_PC_TRIAL.md', 'README_PHONE.txt', 'DEPLOY_HOSTING.md',
    '開啟 Bible100.bat', '.htaccess'
)
$DirsSlim = @(
    'js', 'css', 'config', 'help', 'nav_hub', 'tools',
    'bible_study', 'church_ministry', 'school_management',
    'ai_tools', 'smart_ministry', 'qna', 'disciple_dynamics',
    'hymn_management'
)
$DirsHosting = $DirsSlim + @('languages')
$DirsFull = $DirsHosting + @('church_planning', 'central_member_db', 'translation_system')

$Dirs = switch ($Profile) {
    'Slim' { $DirsSlim }
    'HostingSlim' { $DirsHosting }
    'Full' { $DirsFull }
}

foreach ($f in $Always) {
    $src = Join-Path $Root $f
    if (Test-Path $src) { Copy-Item $src (Join-Path $Temp $f) -Force }
}

foreach ($d in $Dirs) {
    $src = Join-Path $Root $d
    if (-not (Test-Path $src)) { continue }
    Write-Host "Copy $d ..."
    $xd = @('backups', 'archive', 'node_modules', 'dist', '.git')
    if ($d -eq 'hymn_management' -and $Profile -eq 'Slim') {
        $xd += 'hymn'
    }
    $robArgs = @($src, (Join-Path $Temp $d), '/E') + ($xd | ForEach-Object { '/XD'; $_ }) + '/NFL', '/NDL', '/NJH', '/NJS'
    robocopy @robArgs | Out-Null
}

if ($Profile -ne 'Slim') {
    $langCn = Join-Path $Root 'languages\cn'
    if (Test-Path $langCn) {
        $dst = Join-Path $Temp 'languages\cn'
        New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
        robocopy $langCn $dst /E /NFL /NDL /NJH /NJS | Out-Null
        foreach ($f in @('index_cn.html', 'landing_new_cn.html', 'landP_cn.html', 'index.html')) {
            $lf = Join-Path $Root "languages\$f"
            if (Test-Path $lf) {
                Copy-Item $lf (Join-Path $Temp "languages\$f") -Force
            }
        }
    }
}

# hymn: dashboard + entry only for Slim
if ($Profile -eq 'Slim') {
    $hymnEntry = Join-Path $Root 'hymn_management\hymn'
    $hDst = Join-Path $Temp 'hymn_management\hymn'
    New-Item -ItemType Directory -Path $hDst -Force | Out-Null
    foreach ($hf in @('hymn_main_index.html', 'default.htm', 'index_hymn_web\hymn_English_Title.htm')) {
        $hs = Join-Path $hymnEntry ($hf -replace '/', '\')
        if (Test-Path $hs) {
            $hd = Join-Path $hDst (Split-Path $hf -Parent)
            if ($hd -and -not (Test-Path $hd)) { New-Item -ItemType Directory -Path $hd -Force | Out-Null }
            Copy-Item $hs (Join-Path $hDst $hf) -Force
        }
    }
}

node (Join-Path $Root 'scripts\generate_config_embedded.js') 2>$null
Copy-Item (Join-Path $Root 'js\config-embedded.js') (Join-Path $Temp 'js\') -Force -ErrorAction SilentlyContinue

Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $OutPath) { Remove-Item $OutPath -Force }
# Zip via 7z or Compress-Archive (avoids long-path issues in .NET ZipFile)
$sevenZip = 'C:\Program Files\7-Zip\7z.exe'
if (Test-Path $sevenZip) {
    & $sevenZip a -tzip $OutPath "$Temp\*" -r | Out-Null
} else {
    Compress-Archive -Path "$Temp\*" -DestinationPath $OutPath -Force
}
Remove-Item $Temp -Recurse -Force

$mb = [math]::Round((Get-Item $OutPath).Length / 1MB, 2)
Write-Host "Created: $OutPath ($mb MB)"
Write-Host "On PC/phone: unzip, double-click index.html"
