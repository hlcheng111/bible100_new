$root = $PSScriptRoot.TrimEnd('\')
Get-ChildItem -LiteralPath $root -Recurse -Filter "*.html" | ForEach-Object {
  $full = $_.FullName
  if ($full -match '\\_inject_lab_nav\.ps1$') { return }
  $rel = $full.Substring($root.Length + 1)
  $depth = ($rel -split '\\').Count - 1
  $src = if ($depth -eq 0) { 'assets/js/lab-frame-nav.js' } else { ('../' * $depth) + 'assets/js/lab-frame-nav.js' }
  $raw = [System.IO.File]::ReadAllText($full)
  if ($raw -match 'lab-frame-nav\.js') { return }
  if ($raw -notmatch '(?i)</head>') { Write-Host "Skip (no head): $rel"; return }
  $tag = "  <script src=""$src""></script>`r`n"
  $new = [regex]::Replace($raw, '(?i)</head>', $tag + '</head>', 1)
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($full, $new, $utf8)
  Write-Host "Injected: $rel"
}
