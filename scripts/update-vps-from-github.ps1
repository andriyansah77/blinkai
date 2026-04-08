# Update VPS from GitHub
$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "Updating VPS from GitHub..." -ForegroundColor Blue

# Upload and execute the update script
Write-Host "Uploading update script..." -ForegroundColor Yellow
scp scripts/update-vps.sh "$VPS_USER@$VPS_HOST":/root/

Write-Host "Executing update on VPS..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "chmod +x /root/update-vps.sh && /root/update-vps.sh"

Write-Host ""
Write-Host "VPS update completed!" -ForegroundColor Green
Write-Host "Check your application: http://$VPS_HOST`:3000" -ForegroundColor Cyan