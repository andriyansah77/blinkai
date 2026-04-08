# Update VPS from GitHub
$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"

Write-Host "Updating VPS from GitHub..." -ForegroundColor Blue

# Pull latest changes and update
ssh "$VPS_USER@$VPS_HOST" @"
cd blinkai

echo "Pulling latest changes from GitHub..."
git pull origin main

echo "Fixing package.json dependencies..."
sed -i 's/"@types\/marked": "\^12\.0\.0"/"@types\/marked": "^5.0.0"/' package.json

echo "Installing/updating dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Setting up database..."
npm run db:push

echo "Building application..."
npm run build

echo "Restarting PM2..."
pm2 restart blinkai

echo "Update completed!"
pm2 status
"@

Write-Host ""
Write-Host "VPS update completed!" -ForegroundColor Green
Write-Host "Check your application: http://$VPS_HOST`:3000" -ForegroundColor Cyan