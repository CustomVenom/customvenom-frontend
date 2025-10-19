# Smoke Test Suite for CustomVenom (PowerShell)
# Run: .\scripts\smoke-test.ps1 [-ApiBase "https://..."]

param(
    [string]$ApiBase = "https://customvenom-workers-api.jdewett81.workers.dev",
    [string]$DemoWeek = "2025-06"
)

# Config
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Colors
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Results
$Script:Passed = 0
$Script:Failed = 0
$Script:Warnings = 0

# Helper Functions
function Pass {
    param([string]$Message)
    Write-Host "$Green✅ PASS$Reset $Message"
    $Script:Passed++
}

function Fail {
    param([string]$Message)
    Write-Host "$Red❌ FAIL$Reset $Message"
    $Script:Failed++
}

function Warn {
    param([string]$Message)
    Write-Host "$Yellow⚠️  WARN$Reset $Message"
    $Script:Warnings++
}

function Info {
    param([string]$Message)
    Write-Host "$Blue ℹ️  INFO$Reset $Message"
}

function Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "$Blue━━━ $Title ━━━$Reset"
}

# Header
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔥 CustomVenom Smoke Test Suite"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "API Base: $ApiBase"
Write-Host "Demo Week: $DemoWeek"
Write-Host "Time: $(Get-Date)"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Test 1: Health Check
Section "Test 1: API Health Check"
Info "GET $ApiBase/health"

try {
    $healthResponse = Invoke-WebRequest -Uri "$ApiBase/health" -Method Get -UseBasicParsing
    $healthBody = $healthResponse.Content | ConvertFrom-Json
    
    if ($healthResponse.StatusCode -eq 200) {
        Pass "Health endpoint returns 200"
        
        if ($healthBody.ok -eq $true) {
            Pass "Health status: ok"
        } else {
            Fail "Health status not ok: $($healthBody.ok)"
        }
        
        if ($healthBody.schema_version) {
            Pass "schema_version present: $($healthBody.schema_version)"
        } else {
            Fail "schema_version missing"
        }
        
        if ($healthBody.last_refresh) {
            Pass "last_refresh present: $($healthBody.last_refresh)"
        } else {
            Fail "last_refresh missing"
        }
    } else {
        Fail "Health endpoint returned $($healthResponse.StatusCode)"
    }
} catch {
    Fail "Health check failed: $($_.Exception.Message)"
}

# Test 2: Projections Headers
Section "Test 2: Projections Cache Headers"
Info "GET $ApiBase/projections?week=$DemoWeek"

try {
    $projResponse = Invoke-WebRequest -Uri "$ApiBase/projections?week=$DemoWeek" -Method Get -UseBasicParsing
    
    if ($projResponse.StatusCode -eq 200) {
        Pass "Projections endpoint returns 200"
        
        # Check headers
        $headers = $projResponse.Headers
        
        if ($headers.'x-schema-version') {
            Pass "x-schema-version header present: $($headers.'x-schema-version')"
        } else {
            Fail "x-schema-version header missing"
        }
        
        if ($headers.'x-last-refresh') {
            $refreshVal = $headers.'x-last-refresh'
            Pass "x-last-refresh header present: $($refreshVal.Substring(0, [Math]::Min(20, $refreshVal.Length)))..."
        } else {
            Fail "x-last-refresh header missing"
        }
        
        if ($headers.'cache-control') {
            Pass "cache-control header present: $($headers.'cache-control')"
        } else {
            Warn "cache-control header missing (recommended)"
        }
        
        if ($headers.'x-stale') {
            Warn "Serving stale data: x-stale=$($headers.'x-stale')"
            
            if ($headers.'x-stale-age') {
                Info "Stale age: $($headers.'x-stale-age') seconds"
            }
        } else {
            Pass "Serving fresh data (no x-stale header)"
        }
    } else {
        Fail "Projections endpoint returned $($projResponse.StatusCode)"
    }
} catch {
    Fail "Projections check failed: $($_.Exception.Message)"
}

# Test 3: Projections Response Body
Section "Test 3: Projections Data Structure"

try {
    $projBody = (Invoke-WebRequest -Uri "$ApiBase/projections?week=$DemoWeek" -UseBasicParsing).Content | ConvertFrom-Json
    
    Pass "Valid JSON response"
    
    if ($projBody.data -and $projBody.data.Count -gt 0) {
        Pass "Data array present with $($projBody.data.Count) players"
        
        $firstPlayer = $projBody.data[0]
        if ($firstPlayer.name) {
            Pass "Player objects have 'name' field"
        } else {
            Fail "Player objects missing 'name' field"
        }
        
        if ($firstPlayer.PSObject.Properties.Name -contains 'projected') {
            Pass "Player objects have 'projected' field"
        } else {
            Warn "Player objects missing 'projected' field"
        }
    } else {
        Warn "Data array empty (might be expected for demo week)"
    }
    
    if ($projBody.meta) {
        Pass "Metadata present"
    } else {
        Warn "Metadata missing"
    }
} catch {
    Fail "Failed to parse projections body: $($_.Exception.Message)"
}

# Test 4: Additional Endpoints
Section "Test 4: Additional Endpoints"

# Stats
Info "Checking /stats..."
try {
    $statsResponse = Invoke-WebRequest -Uri "$ApiBase/stats" -Method Get -UseBasicParsing
    if ($statsResponse.StatusCode -eq 200) {
        Pass "/stats returns 200"
    } else {
        Warn "/stats returned $($statsResponse.StatusCode)"
    }
} catch {
    Warn "/stats failed: $($_.Exception.Message)"
}

# Weather
Info "Checking /weather..."
try {
    $weatherResponse = Invoke-WebRequest -Uri "$ApiBase/weather" -Method Get -UseBasicParsing
    if ($weatherResponse.StatusCode -eq 200) {
        Pass "/weather returns 200"
    } else {
        Warn "/weather returned $($weatherResponse.StatusCode)"
    }
} catch {
    Warn "/weather failed: $($_.Exception.Message)"
}

# Test 5: Performance
Section "Test 5: Performance Check"

# Health timing
$healthStart = Get-Date
try {
    $null = Invoke-WebRequest -Uri "$ApiBase/health" -UseBasicParsing
    $healthTime = (Get-Date) - $healthStart
    $healthMs = [int]$healthTime.TotalMilliseconds
    
    if ($healthMs -lt 300) {
        Pass "/health response time: ${healthMs}ms (< 300ms)"
    } elseif ($healthMs -lt 1000) {
        Warn "/health response time: ${healthMs}ms (> 300ms)"
    } else {
        Fail "/health response time: ${healthMs}ms (> 1000ms)"
    }
} catch {
    Warn "Failed to measure health timing"
}

# Projections timing
$projStart = Get-Date
try {
    $null = Invoke-WebRequest -Uri "$ApiBase/projections?week=$DemoWeek" -UseBasicParsing
    $projTime = (Get-Date) - $projStart
    $projMs = [int]$projTime.TotalMilliseconds
    
    if ($projMs -lt 500) {
        Pass "/projections response time: ${projMs}ms (< 500ms)"
    } elseif ($projMs -lt 2000) {
        Warn "/projections response time: ${projMs}ms (> 500ms)"
    } else {
        Fail "/projections response time: ${projMs}ms (> 2000ms)"
    }
} catch {
    Warn "Failed to measure projections timing"
}

# Final Report
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📊 Test Results Summary"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "$Green✅ Passed:  $Script:Passed$Reset"
Write-Host "$Red❌ Failed:  $Script:Failed$Reset"
Write-Host "$Yellow⚠️  Warnings: $Script:Warnings$Reset"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($Script:Failed -gt 0) {
    Write-Host "$Red❌ SMOKE TEST FAILED$Reset"
    exit 1
} else {
    Write-Host "$Green✅ SMOKE TEST PASSED$Reset"
    if ($Script:Warnings -gt 0) {
        Write-Host "$Yellow⚠️  Review warnings above$Reset"
    }
    exit 0
}


