# ReAgent VPS Update Script - Update from GitHub with Dashboard Improvements
$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "🚀 Updating ReAgent VPS with Real Dashboard Data..." -ForegroundColor Blue
Write-Host "====================================================" -ForegroundColor Blue

# Execute update commands directly with proper git handling
Write-Host "📥 Pulling latest changes and rebuilding..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && git reset --hard HEAD && git pull origin main && rm -rf node_modules package-lock.json && npm install && npx prisma generate && npm run db:push && npm run build && pm2 restart blinkai && pm2 status"

Write-Host ""
Write-Host "✅ ReAgent VPS update completed!" -ForegroundColor Green
Write-Host "🎉 Dashboard now shows real Hermes data instead of templates!" -ForegroundColor Cyan
Write-Host "🌐 Check your application: http://$VPS_HOST`:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Updated Features:" -ForegroundColor Yellow
Write-Host "  • Jobs page with real Hermes cron jobs" -ForegroundColor White
Write-Host "  • Terminal with actual Hermes CLI integration" -ForegroundColor White
Write-Host "  • Workspace showing Hermes files and data" -ForegroundColor White
Write-Host "  • All dashboard pages use live Hermes APIs" -ForegroundColor White