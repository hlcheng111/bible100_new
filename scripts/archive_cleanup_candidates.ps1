# Move duplicate/temp hymn assets and non-primary apps to archive (pre-cleanup wave)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ArchiveRoot = Join-Path $Root "archive\20260521_cleanup"
New-Item -ItemType Directory -Path $ArchiveRoot -Force | Out-Null

function Move-IfExists($src, $dstParent) {
    if (-not (Test-Path $src)) { return $false }
    $rel = $src.Substring($Root.Length).TrimStart('\')
    $dst = Join-Path $dstParent $rel
    $dstDir = Split-Path $dst -Parent
    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    Move-Item -LiteralPath $src -Destination $dst -Force
    Write-Host "MOVED: $rel"
    return $true
}

# hymn dist snapshot
$dist = Join-Path $Root "hymn_management\dist"
if (Test-Path $dist) {
    $dstDist = Join-Path $ArchiveRoot "hymn_management_dist"
    Move-Item -LiteralPath $dist -Destination $dstDist -Force
    Write-Host "MOVED: hymn_management/dist -> archive/.../hymn_management_dist"
}

# church-planning (Next.js) - church_planning (Vite) is primary
$cpNext = Join-Path $Root "church-planning"
if (Test-Path $cpNext) {
    $dstCp = Join-Path $ArchiveRoot "church-planning-next"
    Move-Item -LiteralPath $cpNext -Destination $dstCp -Force
    Write-Host "MOVED: church-planning -> archive/.../church-planning-next"
}

# hymn: large .mht temp indexes
$hymnRoot = Join-Path $Root "hymn_management\hymn"
if (Test-Path $hymnRoot) {
    Get-ChildItem -LiteralPath $hymnRoot -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Extension -eq ".mht" -or $_.Name -match "temp|複製|复制|copy|FIXED_"
    } | ForEach-Object {
        $dstParent = Join-Path $ArchiveRoot "hymn_files"
        Move-IfExists $_.FullName $dstParent | Out-Null
    }
    Get-ChildItem -LiteralPath $hymnRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -match "複製|复制" -and $_.Extension -match "\.(htm|html)$"
    } | ForEach-Object {
        $dstParent = Join-Path $ArchiveRoot "hymn_duplicates"
        Move-IfExists $_.FullName $dstParent | Out-Null
    }
}

Write-Host "Archive cleanup wave done: $ArchiveRoot"
