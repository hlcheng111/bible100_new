param(
  [Parameter(Mandatory = $true)][string]$ProbeUrl,
  [int]$MaxAttempts = 25,
  [int]$SleepSeconds = 2
)
for ($i = 0; $i -lt $MaxAttempts; $i++) {
  try {
    $r = Invoke-WebRequest -Uri $ProbeUrl -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { exit 0 }
  } catch {}
  Start-Sleep -Seconds $SleepSeconds
}
exit 1
