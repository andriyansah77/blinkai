# PowerShell script to verify REAGENT token deployment

Write-Host "🔍 REAGENT Token Verification Script" -ForegroundColor Cyan
Write-Host ""

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

# Run verification
Write-Host "🔍 Starting verification..." -ForegroundColor Cyan
npx ts-node scripts/verify-reagent-roles.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Verification completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Verification failed" -ForegroundColor Red
    exit 1
}
