# Simple VPS Deployment Script for BlinkAI
# Target: 159.65.141.68 (root)

$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"
$REPO = "andriyansah77/blinkai"

Write-Host "Deploying BlinkAI to VPS: $VPS_HOST" -ForegroundColor Blue

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Blue
try {
    $result = ssh -o ConnectTimeout=10 "$VPS_USER@$VPS_HOST" "echo 'Connected'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SSH connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "Cannot connect to VPS. Check:" -ForegroundColor Red
    Write-Host "1. VPS is running" -ForegroundColor Yellow
    Write-Host "2. SSH access is available" -ForegroundColor Yellow
    Write-Host "3. Try: ssh $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
    exit 1
}

$confirm = Read-Host "Continue deployment? (y/N)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

# Execute deployment
Write-Host "Starting deployment..." -ForegroundColor Blue

# Update system
Write-Host "Updating system..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "apt update -y"

# Install Node.js
Write-Host "Installing Node.js..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"

# Install Git
Write-Host "Installing Git..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "apt install -y git"

# Install PM2
Write-Host "Installing PM2..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "npm install -g pm2"

# Check versions
Write-Host "Checking installed versions..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "node --version && npm --version && git --version"

# Check Hermes
Write-Host "Checking Hermes CLI..." -ForegroundColor Blue
$hermesCheck = ssh "$VPS_USER@$VPS_HOST" "which hermes || echo 'NOT_FOUND'"
$hermesAvailable = if ($hermesCheck -eq "NOT_FOUND") { "false" } else { "true" }
Write-Host "Hermes available: $hermesAvailable" -ForegroundColor Cyan

# Clone repository
Write-Host "Cloning repository..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "rm -rf blinkai && git clone https://github.com/$REPO.git blinkai"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm install"

# Create environment file
Write-Host "Creating environment file..." -ForegroundColor Blue
$envContent = @"
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://$VPS_HOST:3000"
NEXTAUTH_SECRET="blinkai-secret-$(Get-Random -Maximum 99999)"

# AI Configuration (EDIT THESE!)
AI_API_KEY="sk-your-openai-api-key-here"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Framework
HERMES_CLI_AVAILABLE="$hermesAvailable"
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"

# Platform Branding
NEXT_PUBLIC_PLATFORM_NAME="HermesAI"
NEXT_PUBLIC_PLATFORM_TAGLINE="Deploy Your AI Agents in Seconds"

# Credit System
SIGNUP_CREDIT_BONUS=1000
CREDIT_COST_PER_1K_TOKENS=10
"@

# Write env file to VPS
$envContent | ssh "$VPS_USER@$VPS_HOST" "cat > blinkai/.env"

# Setup database
Write-Host "Setting up database..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run setup"

# Build application
Write-Host "Building application..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run build"

# Start with PM2
Write-Host "Starting application with PM2..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && pm2 delete blinkai || true && pm2 start npm --name blinkai -- start && pm2 save"

# Check status
Write-Host "Checking application status..." -ForegroundColor Blue
$status = ssh "$VPS_USER@$VPS_HOST" "pm2 list"
Write-Host $status

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  URL: http://$VPS_HOST`:3000" -ForegroundColor Cyan
Write-Host "  API: http://$VPS_HOST`:3000/api/hermes/status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit API keys: ssh $VPS_USER@$VPS_HOST 'nano blinkai/.env'" -ForegroundColor Yellow
Write-Host "2. Restart app: ssh $VPS_USER@$VPS_HOST 'pm2 restart blinkai'" -ForegroundColor Yellow
Write-Host "3. Test in browser: http://$VPS_HOST`:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Management commands:" -ForegroundColor Cyan
Write-Host "  Status: ssh $VPS_USER@$VPS_HOST 'pm2 status'" -ForegroundColor Cyan
Write-Host "  Logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs blinkai'" -ForegroundColor Cyan
Write-Host "  Restart: ssh $VPS_USER@$VPS_HOST 'pm2 restart blinkai'" -ForegroundColor Cyan