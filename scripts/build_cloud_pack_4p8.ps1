# Build Bible100 <=4.8GB pack to sibling folder (NOT inside git repo)
# Default Dest: C:\Users\hlche\.cursor\bible100_new_2
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\build_cloud_pack_4p8.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\build_cloud_pack_4p8.ps1 -Dest "D:\bible100_cloud_4p8"
#   powershell -ExecutionPolicy Bypass -File scripts\build_cloud_pack_4p8.ps1 -WhatIf

param(
  [string]$Dest = "",
  [switch]$WhatIf,
  [switch]$SkipHymn
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $Root "index_v5.html"))) {
  throw "Repo root not found from $PSScriptRoot"
}

if (-not $Dest) {
  $Dest = Join-Path (Split-Path $Root -Parent) "bible100_new_2"
}

$limitBytes = [int64](4.8 * 1GB)
Write-Host "Source: $Root"
Write-Host "Dest:   $Dest"
Write-Host "Limit:  4.8 GB"

$driveLetter = (Split-Path $Dest -Qualifier).TrimEnd(':')
$free = (Get-PSDrive $driveLetter).Free
if ($free -lt 6GB) {
  Write-Warning ("Free space on dest drive ~ {0:N1} GB; need about 3-5 GB free." -f ($free / 1GB))
}

if (-not $WhatIf) {
  if (Test-Path $Dest) {
    Write-Host "Dest exists - will update selected trees."
  } else {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  }
}

function Copy-One([string]$rel, [string[]]$ExtraExcludeDirs = @()) {
  $src = Join-Path $Root $rel
  if (-not (Test-Path $src)) {
    Write-Host "SKIP missing: $rel" -ForegroundColor Yellow
    return
  }
  $dst = Join-Path $Dest $rel
  $dstParent = Split-Path $dst -Parent
  if (-not $WhatIf -and -not (Test-Path $dstParent)) {
    New-Item -ItemType Directory -Path $dstParent -Force | Out-Null
  }

  $xd = @(".git", "node_modules", "dist", "_archive", ".cursor") + $ExtraExcludeDirs
  # disciple_dynamics large PDFs excluded globally; keep pack lean
  $xf = @("*.mp4", "*.zip", "*.mht", "*.pdf")

  if ($WhatIf) {
    Write-Host "WOULD copy: $rel"
    return
  }

  if (Test-Path $src -PathType Leaf) {
    Copy-Item -LiteralPath $src -Destination $dst -Force
    Write-Host "FILE $rel"
    return
  }

  $roboArgs = @($src, $dst, "/E", "/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS", "/NP")
  foreach ($d in $xd) { $roboArgs += "/XD"; $roboArgs += $d }
  foreach ($f in $xf) { $roboArgs += "/XF"; $roboArgs += $f }
  & robocopy @roboArgs | Out-Null
  $code = $LASTEXITCODE
  if ($code -ge 8) {
    throw "robocopy failed code=$code for $rel"
  }
  Write-Host ("OK   {0}" -f $rel)
}

Write-Host ""
Write-Host "=== Copy shell ==="
@(
  "index.html",
  "index_v5.html",
  "js",
  "css",
  "config",
  "help",
  "nav_hub"
) | ForEach-Object { Copy-One $_ }

Write-Host ""
Write-Host "=== Copy modules ==="
@(
  "bible_study",
  "church_ministry",
  "ai_tools",
  "school_management",
  "smart_ministry",
  "qna",
  "disciple_dynamics"
) | ForEach-Object { Copy-One $_ }

Copy-One "church_planning" @("image_plan")

# bible_app: shell + SQLite bible (no Expo app source / node_modules / firebase)
Write-Host ""
Write-Host "=== Copy bible_app shell + bible_reader.db ==="
Copy-One "bible_app\index.html"
Copy-One "bible_app\shell"
Copy-One "bible_app\app\assets\bible"
@(
  "bible_app\START-WEB.cmd",
  "bible_app\Open-BibleApp-Web-Preview.cmd"
) | ForEach-Object { Copy-One $_ }
# Chinese-named launchers (match by extension under bible_app root)
if (-not $WhatIf) {
  Get-ChildItem -LiteralPath (Join-Path $Root "bible_app") -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -in @('.bat', '.vbs') } |
    ForEach-Object {
      $rel = "bible_app\" + $_.Name
      Copy-One $rel
    }
}

if (-not $SkipHymn) {
  Write-Host ""
  Write-Host "=== Copy hymn_management (large) ==="
  Copy-One "hymn_management"
} else {
  Write-Host "SKIP hymn_management (-SkipHymn)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Copy languages ==="
Copy-One "languages\images"
Copy-One "languages\media"
Copy-One "languages\cn"
Copy-One "languages\en"
Copy-One "languages\id"
Copy-One "languages\ch"
Copy-One "languages\ad"
Copy-One "languages\my"
Copy-One "languages\kh"
Copy-One "languages\lo"
Copy-One "languages\scripts"
Copy-One "languages\_landing"
Copy-One "languages\js"
@(
  "languages\index.html",
  "languages\index_cn.html",
  "languages\index_en.html",
  "languages\index_vi.html",
  "languages\index_id.html",
  "languages\index_ch.html",
  "languages\index_ad.html",
  "languages\index_kh.html",
  "languages\index_lo.html",
  "languages\landing_new_cn.html",
  "languages\landP_cn.html",
  "languages\landP_en.html",
  "languages\landP_vi.html",
  "languages\landP_id.html",
  "languages\landP_ch.html",
  "languages\landP_ad.html",
  "languages\landP_kh.html",
  "languages\landP_lo.html",
  "languages\ot_landing.html",
  "languages\nt_landing.html",
  "languages\t4_landing.html",
  "languages\MEDIA_STRUCTURE.md"
) | ForEach-Object { Copy-One $_ }

Write-Host ""
Write-Host "=== Copy languages/vi then strip *.files ==="
Copy-One "languages\vi"
if (-not $WhatIf) {
  $viRoot = Join-Path $Dest "languages\vi"
  Get-ChildItem $viRoot -Recurse -Directory -Filter "*.files" -ErrorAction SilentlyContinue |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
      $relShow = $_.FullName.Substring($Dest.Length).TrimStart('\')
      Write-Host ("STRIP {0}" -f $relShow)
    }
  $stub = Join-Path $viRoot "media\images\image_NT"
  if (Test-Path $stub) {
    Remove-Item -LiteralPath $stub -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "STRIP languages\vi\media\images\image_NT"
  }
}

Write-Host ""
Write-Host "=== Copy data (clean bibles + small commentaries) ==="
Copy-One "data\bibles\clean"
Copy-One "data\commentaries"

if (-not $WhatIf) {
  $handoutSrc = Join-Path $Root "docs\governance\CLOUD_PACK_USB_HANDOUT_ZH.md"
  $readmeDst = Join-Path $Dest "README_cloud_USB.txt"
  if (Test-Path $handoutSrc) {
    Copy-Item -LiteralPath $handoutSrc -Destination $readmeDst -Force
  }
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $meta = @(
    "Bible100 cloud/USB trial pack (<=4.8GB skeleton)",
    "Built: $stamp",
    "Source: $Root",
    "Spec: docs/governance/CLOUD_PACK_4P8_FULL_V1.md",
    "Excluded: data/cj (incl comprehensive.db), data/orig, vi/**/*.files",
    "Read: README_cloud_USB.txt"
  ) -join "`r`n"
  Set-Content -Path (Join-Path $Dest "PACK_META.txt") -Value $meta -Encoding UTF8
}

Write-Host ""
Write-Host "=== Measure dest ==="
if (-not $WhatIf -and (Test-Path $Dest)) {
  $sum = (Get-ChildItem $Dest -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  if ($null -eq $sum) { $sum = [int64]0 }
  $mb = [math]::Round($sum / 1MB, 1)
  $gb = [math]::Round($sum / 1GB, 2)
  Write-Host ("PACK SIZE: {0} MB ({1} GB)" -f $mb, $gb)
  if ($sum -gt $limitBytes) {
    Write-Host "FAIL: exceeds 4.8 GB" -ForegroundColor Red
    exit 1
  }
  Write-Host "OK under 4.8 GB" -ForegroundColor Green
  Write-Host "Next: wipe lovestoblog old files, upload this folder; or copy to USB."
}
