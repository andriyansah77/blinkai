# Update VPS from GitHub
# This script connects to VPS via SSH and pulls latest changes

$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"
$APP_DIR = "/root/blinkai"

Write-Host "🚀 Updating VPS from GitHub..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# SSH commands to execute on VPS
$sshCommands = @"
cd /root/blinkai && \
echo '📥 Pulling latest changes from GitHub...' && \
git pull origin main && \
echo '📦 Installing dependencies...' && \
npm install && \
echo '🗄️  Running database migrations...' && \
npx prisma migrate deploy && \
echo '🔨 Building application...' && \
npm run build && \
echo '🔄 Restarting PM2 process...' && \
pm2 restart reagent || pm2 start npm --name reagent -- start && \
echo '✅ VPS update complete!' && \
echo '' && \
echo '📊 PM2 Status:' && \
pm2 status
"@

# Execute SSH command
Write-Host "Connecting to VPS: $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" $sshCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment to VPS completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Application should be running at: http://${VPS_HOST}:3000" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
