# Fix VPS Deployment Issues
$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "Fixing VPS deployment issues..." -ForegroundColor Blue

# Fix package.json dependencies
Write-Host "Fixing package.json..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
cd blinkai
# Fix marked types version
sed -i 's/"@types\/marked": "\^12\.0\.0"/"@types\/marked": "^5.0.0"/' package.json
echo "Package.json fixed"
"@

# Reinstall dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm install"

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npx prisma generate"

# Setup database
Write-Host "Setting up database..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run db:push"

# Build application
Write-Host "Building application..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run build"

# Restart PM2
Write-Host "Restarting application..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && pm2 restart blinkai"

# Check status
Write-Host "Checking application status..." -ForegroundColor Blue
$status = ssh "$VPS_USER@$VPS_HOST" "pm2 status && pm2 logs blinkai --lines 10"
Write-Host $status

Write-Host ""
Write-Host "Fix completed!" -ForegroundColor Green
Write-Host "Test your application: http://$VPS_HOST`:3000" -ForegroundColor Cyan