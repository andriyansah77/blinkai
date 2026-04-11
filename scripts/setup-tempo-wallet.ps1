# Setup Tempo Wallet CLI for automated deployment (Windows)

Write-Host "🚀 Setting up Tempo Wallet CLI" -ForegroundColor Cyan
Write-Host ""

# Check if tempo CLI is installed
$tempoInstalled = Get-Command tempo -ErrorAction SilentlyContinue

if (-not $tempoInstalled) {
    Write-Host "📦 Installing Tempo CLI..." -ForegroundColor Yellow
    
    # Download and install Tempo CLI for Windows
    $installScript = Invoke-WebRequest -Uri "https://tempo.xyz/install" -UseBasicParsing
    Invoke-Expression $installScript.Content
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✅ Tempo CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Tempo CLI already installed" -ForegroundColor Green
}

# Check tempo version
Write-Host ""
Write-Host "📋 Tempo CLI version:" -ForegroundColor Cyan
tempo --version

# Login to Tempo Wallet
Write-Host ""
Write-Host "🔐 Logging in to Tempo Wallet..." -ForegroundColor Cyan
Write-Host "   This will open a browser window for authentication" -ForegroundColor Yellow
tempo wallet login

# Check wallet status
Write-Host ""
Write-Host "💰 Wallet status:" -ForegroundColor Cyan
tempo wallet status

# Get wallet address
Write-Host ""
Write-Host "📍 Wallet address:" -ForegroundColor Cyan
tempo wallet address

Write-Host ""
Write-Host "✅ Tempo Wallet setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Fund your wallet with test tokens" -ForegroundColor White
Write-Host "  2. Run deployment: npm run reagent:deploy:tempo" -ForegroundColor White
