# Test API Health Endpoint
Write-Host "Testing API Health Endpoint..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Health Check Response:" -ForegroundColor Green
    Write-Host $response.Content
    Write-Host ""
    
    # Test Questions Endpoint (no auth required)
    Write-Host "Testing Questions Endpoint..." -ForegroundColor Cyan
    $questionsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/questions?page=1&limit=10" `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Questions Response:" -ForegroundColor Green
    $questionsResponse.Content | ConvertFrom-Json | ConvertTo-Json
    
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor Red
}
