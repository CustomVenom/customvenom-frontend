$BASE_URL = "https://www.customvenom.com"
$FORBIDDEN = @("Connect Yahoo", "YahooStatusBadge", "League Integration", "Choose Your Team", "Refresh league", "Yahoo Fantasy")

try {
    $root = Invoke-WebRequest -Uri "$BASE_URL/" -Headers @{"accept"="text/html"} -UseBasicParsing
    $settings = Invoke-WebRequest -Uri "$BASE_URL/settings" -Headers @{"accept"="text/html"} -UseBasicParsing

    foreach ($f in $FORBIDDEN) {
        if ($root.Content -match $f -or $settings.Content -match $f) {
            Write-Error "FORBIDDEN found: $f"
            exit 1
        }
    }

    Write-Host "PASS: no forbidden provider text on / or /settings"
} catch {
    Write-Error "Content sweep failed: $_"
    exit 1
}
