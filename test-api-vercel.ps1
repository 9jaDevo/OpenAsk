# OpenAsk API Test Script for Vercel Deployment
# Tests the deployed API on Vercel

$baseUrl = "https://open-ask-api-cdcq.vercel.app"
$apiUrl = "$baseUrl/api/v1"

Write-Host "🧪 Testing OpenAsk API on Vercel..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Health check passed!" -ForegroundColor Green
        Write-Host "   Status: $($json.status)" -ForegroundColor Gray
        Write-Host "   Uptime: $([Math]::Round($json.uptime, 2))s" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This means the API is not deployed correctly yet." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: List Questions (Public endpoint)
Write-Host "2️⃣  Testing List Questions..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/questions?limit=5" -Method GET -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Questions endpoint works!" -ForegroundColor Green
        Write-Host "   Found: $($json.total) questions" -ForegroundColor Gray
        Write-Host "   Current page: $($json.page)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ❌ Questions endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Top Tags (Public endpoint)
Write-Host "3️⃣  Testing Top Tags..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/tags/top?limit=5" -Method GET -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Tags endpoint works!" -ForegroundColor Green
        Write-Host "   Found: $($json.Length) tags" -ForegroundColor Gray
        if ($json.Length -gt 0) {
            Write-Host "   Top tag: $($json[0].tag) ($($json[0].count) questions)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "   ❌ Tags endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: CORS Headers
Write-Host "4️⃣  Testing CORS Headers..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin"                         = "https://open-ask-web.vercel.app"
        "Access-Control-Request-Method"  = "GET"
        "Access-Control-Request-Headers" = "authorization"
    }
    $response = Invoke-WebRequest -Uri "$apiUrl/questions" -Method OPTIONS -Headers $headers -UseBasicParsing
    
    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    $allowCreds = $response.Headers["Access-Control-Allow-Credentials"]
    
    if ($allowOrigin -eq "https://open-ask-web.vercel.app") {
        Write-Host "   ✅ CORS configured correctly!" -ForegroundColor Green
        Write-Host "   Allow-Origin: $allowOrigin" -ForegroundColor Gray
        Write-Host "   Allow-Credentials: $allowCreds" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  CORS may need adjustment" -ForegroundColor Yellow
        Write-Host "   Allow-Origin: $allowOrigin" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend URL: https://open-ask-web.vercel.app" -ForegroundColor Green
Write-Host "API URL: $apiUrl" -ForegroundColor Green
