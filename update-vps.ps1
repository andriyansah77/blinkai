# PowerShell script to update VPS
# Run this with: .\update-vps.ps1

Write-Host "🚀 Updating ReAgent VPS..." -ForegroundColor Cyan
Write-Host ""

$vpsHost = "root@159.65.141.68"

Write-Host "📥 Connecting to VPS and pulling latest code..." -ForegroundColor Yellow

# Create the command to run on VPS
$commands = @"
cd /root/blinkai && \
echo '📥 Pulling latest code...' && \
git pull origin main && \
echo '' && \
echo '🔄 Restarting PM2...' && \
pm2 restart reagent --update-env && \
echo '' && \
echo '✅ Deployment complete!' && \
echo '' && \
echo '📊 PM2 Status:' && \
pm2 status && \
echo '' && \
echo '📝 Recent logs:' && \
pm2 logs reagent --lines 20 --nostream
"@

# Execute SSH command
ssh $vpsHost $commands

Write-Host ""
Write-Host "✅ VPS update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your site: https://reagent.eu.cc" -ForegroundColor Cyan
Write-Host "⛏️  Mining: https://mining.reagent.eu.cc" -ForegroundColor Cyan
