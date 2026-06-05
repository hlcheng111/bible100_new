Param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\.."),
  [string]$TargetFile = ''
)

function Get-ImageListFromFileListXml($filesDir){
  $xmlPath = Join-Path $filesDir 'filelist.xml'
  if(!(Test-Path $xmlPath)){ return @() }
  $raw = Get-Content -Raw -LiteralPath $xmlPath
  $names = Select-String -InputObject $raw -Pattern '<o:File HRef="([^"]+)"' -AllMatches | ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value }
  return $names | Where-Object { $_ -match '\.(jpg|jpeg|png|gif)$' -and $_ -notmatch '\.(wmf|emz)$' }
}

function Rewrite-OneFile($htmlPath){
  $dir = Split-Path -Parent $htmlPath
  $base = [System.IO.Path]::GetFileNameWithoutExtension($htmlPath)
  $filesDir = Join-Path $dir ($base + '.files')
  $imgList = Get-ImageListFromFileListXml $filesDir
  if($imgList.Count -eq 0){ return @{file=$htmlPath; changed=$false; mapped=0} }

  $content = Get-Content -Raw -LiteralPath $htmlPath
  $orig = $content
  $i = 0
  $pattern = 'src\s*=\s*(["\'])\s*([^"\']+)\1'
  $regex = New-Object System.Text.RegularExpressions.Regex($pattern,[System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $content = $regex.Replace($content, { param([System.Text.RegularExpressions.Match]$m)
      $q = $m.Groups[1].Value; $src = $m.Groups[2].Value
      if($src -match '\\.files/') { return $m.Value }
      if($src -match '(^|/|\\)images/'){
        if($script:imgList.Count -gt 0){ $idx = $script:i % $script:imgList.Count; $script:i++;
          $new = './' + $base + '.files/' + $script:imgList[$idx]; return 'src=' + $q + $new + $q }
      }
      return $m.Value })

  if($content -ne $orig){
    $backupRoot = Join-Path $Root 'archive\patch_backups'
    New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
    $backupPath = Join-Path $backupRoot ((($htmlPath.Substring($Root.Length)).TrimStart('\\','/')) -replace '[\\/]','__')
    Set-Content -Path $backupPath -Value $orig -Encoding UTF8
    Set-Content -Path $htmlPath -Value $content -Encoding UTF8
    return @{file=$htmlPath; changed=$true; mapped=$i}
  }
  return @{file=$htmlPath; changed=$false; mapped=0}
}

$targets = @()
if($TargetFile){ $targets = @(Resolve-Path $TargetFile) }
else {
  $targets = Get-ChildItem -Path (Join-Path $Root 'languages') -Recurse -File -Include *.html -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match "\\chapters\\.*\.html$" } | Select-Object -ExpandProperty FullName
}

$changed = 0; $mappedTotal = 0; $total = 0
foreach($f in $targets){
  $total++
  $r = Rewrite-OneFile $f
  if($r.changed){ $changed++ }
  $mappedTotal += $r.mapped
}
Write-Host ("rewrite done. files: {0}, changed: {1}, imgs-mapped: {2}" -f $total,$changed,$mappedTotal)

