# PowerShell codemod: Upgrade http://yahoo.com to https://yahoo.com
# Run from frontend repo root: .\scripts\upgrade-yahoo-https.ps1

Write-Host "🔒 Upgrading Yahoo URLs to HTTPS..." -ForegroundColor Green

# Find all TS/TSX files in src
$files = Get-ChildItem -Recurse -Include *.ts, *.tsx -Path .\src | Select-Object -ExpandProperty FullName

$pattern = 'https://([^"\s]*\.)?yahoo\.com'
$replacement = 'https://$1yahoo.com'

$changed = @()

foreach ($f in $files) {
  $content = Get-Content -Raw -Encoding UTF8 $f
  $newContent = [regex]::Replace($content, $pattern, $replacement)

  if ($newContent -ne $content) {
    # Backup original
    if (-not (Test-Path "$f.bak")) {
      Copy-Item $f "$f.bak" -Force
    }

    # Write updated content
    Set-Content -Encoding UTF8 $f $newContent
    $changed += $f
    Write-Host "✅ Updated: $f" -ForegroundColor Yellow
  }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Updated $($changed.Count) files" -ForegroundColor White

if ($changed.Count -gt 0) {
  Write-Host "`n🔍 Files changed:" -ForegroundColor Cyan
  $changed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

  Write-Host "`n✅ All Yahoo URLs upgraded to HTTPS!" -ForegroundColor Green
  Write-Host "💡 Run 'npm run lint' to verify ESLint rules are satisfied" -ForegroundColor Blue
}
else {
  Write-Host "✨ No HTTP Yahoo URLs found - already secure!" -ForegroundColor Green
}

# Optional: Verify no HTTP Yahoo URLs remain
Write-Host "`n🔍 Verifying no HTTP Yahoo URLs remain..." -ForegroundColor Cyan
$remaining = Select-String -Path $files -Pattern 'https://[^"]*yahoo\.com' -List

if ($remaining) {
  Write-Warning "⚠️  Still found HTTP Yahoo URLs:"
  $remaining | ForEach-Object { Write-Host "  - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
}
else {
  Write-Host "✅ All Yahoo URLs are now HTTPS!" -ForegroundColor Green
}
