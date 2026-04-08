# Update VPS from GitHub
$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "Updating VPS from GitHub..." -ForegroundColor Blue

# Execute update commands directly with proper git handling
Write-Host "Executing update on VPS..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "cd reagent && git reset --hard HEAD && git pull origin main && rm -rf node_modules package-lock.json && npm install && npx prisma generate && npm run db:push && npm run build && pm2 restart reagent && pm2 status"

Write-Host ""
Write-Host "VPS update completed!" -ForegroundColor Green
Write-Host "Check your application: http://$VPS_HOST`:3000" -ForegroundColor Cyan