# Fix VPS Database Schema
# This script syncs the database schema without migration history

$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "🔧 Fixing VPS Database Schema..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# SSH commands to execute on VPS
$sshCommands = @"
cd /root/blinkai && \
echo '🗄️  Syncing database schema...' && \
npx prisma db push --accept-data-loss && \
echo '🔄 Restarting PM2 process...' && \
pm2 restart reagent && \
echo '✅ Database fix complete!' && \
echo '' && \
echo '📊 PM2 Status:' && \
pm2 status
"@

# Execute SSH command
Write-Host "Connecting to VPS: $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" $sshCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database schema fixed successfully!" -ForegroundColor Green
    Write-Host "🌐 Application should be running at: http://${VPS_HOST}:3000" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Database fix failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
