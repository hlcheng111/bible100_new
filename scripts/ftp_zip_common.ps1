# Shared: build FTP ZIP with htdocs/ folder + root README (FileZilla-friendly)

function New-FtpZipPack {
  param(
    [Parameter(Mandatory = $true)][string]$PackRoot,
    [Parameter(Mandatory = $true)][string]$ZipFile,
    [Parameter(Mandatory = $true)][string[]]$ReadmeLines
  )

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $htdocs = Join-Path $PackRoot "htdocs"
  if (-not (Test-Path $htdocs)) {
    throw "Missing htdocs folder: $htdocs"
  }

  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines((Join-Path $PackRoot "README.txt"), $ReadmeLines, $utf8)

  $cnPath = Join-Path $PackRoot "UPLOAD_GUIDE_CN.txt"
  $cnText = @"
Bible100 FTP 上传说明
====================
1. 解压本 ZIP
2. 打开 htdocs 文件夹（里面有 index_v5.html、qna、languages 等子文件夹）
3. FileZilla：选中 htdocs 里面的全部内容，拖到远端 /htdocs/
4. 不要按 PATHS.txt 逐条手动上传；PATHS.txt 只是路径清单
5. 若 ZIP 根目录有 PATHS_DELETE.txt，请在远端删除其中列出的旧文件
"@
  [System.IO.File]::WriteAllText($cnPath, $cnText, $utf8)

  if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    $PackRoot,
    $ZipFile,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
  )
}
