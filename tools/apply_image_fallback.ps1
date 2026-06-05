Param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\.."),
  [switch]$DryRun
)

Write-Host "Start image path fix under: $Root"

$chapterHtmls = Get-ChildItem -Path (Join-Path $Root 'languages') -Recurse -File -Include *.html -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match "\\chapters\\.*\.html$" }

$backupRoot = Join-Path $Root 'archive\patch_backups'
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

$insertMarker = '<!-- img-fallback-injected -->'
$scriptBlock = @'
<script><!-- img-fallback-injected
(function(){
  function fixDepth(src){
    if(!src) return src;
    if(src.indexOf('../../images/') !== -1){
      return src.replace('../../images/','../../../images/');
    }
    return src;
  }
  function attach(img){
    if(img.__imgFixed) return; img.__imgFixed = true;
    var triedLocal = false;
    var orig = img.getAttribute('src')||'';
    img.onerror = function(){
      var cur = img.getAttribute('src')||'';
      if(cur.indexOf('../../images/') !== -1){ img.src = fixDepth(cur); return; }
      if(!triedLocal){
        triedLocal = true;
        var file = cur.split('/').pop();
        var html = (location.pathname.split('/').pop()||'chapter').replace(/\.[^/.]+$/,'');
        img.src = './'+html+'.files/'+file;
        return;
      }
      img.style.display='none';
      if(!img.alt) img.alt='image not found';
    };
    var corrected = fixDepth(orig);
    if(corrected !== orig){ img.setAttribute('src', corrected); }
  }
  var list = document.images || document.querySelectorAll('img');
  for(var i=0;i<list.length;i++){ attach(list[i]); }
})();
// --></script>
'@

$total = 0; $changed = 0; $injected = 0; $replaced = 0;

foreach($f in $chapterHtmls){
  $total++
  $content = Get-Content -Raw -LiteralPath $f.FullName
  $orig = $content
  # step1 replace wrong depth ../../images -> ../../../images
  if($content -like '*../../images/*'){
    $content = $content -replace '\.\.\/\.\.\/images\/', '../../../images/'
    $replaced++
  }
  # step2 inject fallback script once before </body>
  if($content -notlike "*${insertMarker}*"){
    if($content -match '</body>'){
      $content = $content -replace '</body>', ($scriptBlock + "`n</body>")
      $injected++
    } else {
      $content += "`n"+$scriptBlock
      $injected++
    }
  }
  if($content -ne $orig){
    $changed++
    if(-not $DryRun){
      $rel = $f.FullName.Substring($Root.Length).TrimStart('\\','/')
      $backupPath = Join-Path $backupRoot ($rel -replace '[\\/]','__')
      Set-Content -Path $backupPath -Value $orig -Encoding UTF8
      Set-Content -Path $f.FullName -Value $content -Encoding UTF8
    }
  }
}

Write-Host ("Processed: {0}, changed: {1}, replacedDepth: {2}, injected: {3}" -f $total,$changed,$replaced,$injected)

