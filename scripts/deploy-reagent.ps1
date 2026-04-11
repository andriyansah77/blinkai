# PowerShell script to deploy REAGENT token
# This script handles ts-node installation and execution

Write-Host "🚀 REAGENT Token Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if ts-node is available
$tsNodeCheck = npx ts-node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  ts-node not found, installing..." -ForegroundColor Yellow
    npm install --save-dev ts-node
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install ts-node" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Run deployment
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
npx ts-node scripts/deploy-reagent-token.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
