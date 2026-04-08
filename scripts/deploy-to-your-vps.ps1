# Deploy BlinkAI to Your VPS
# VPS: 159.65.141.68
# User: root
# Repository: andriyansah77/blinkai

$VPS_HOST = "159.65.141.68"
$VPS_USER = "root"
$GITHUB_REPO = "andriyansah77/blinkai"

Write-Host "🚀 Deploying BlinkAI to VPS..." -ForegroundColor Blue
Write-Host "VPS: $VPS_HOST" -ForegroundColor Cyan
Write-Host "User: $VPS_USER" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/$GITHUB_REPO" -ForegroundColor Cyan
Write-Host ""

# Test SSH connection
Write-Host "📡 Testing SSH connection..." -ForegroundColor Blue
try {
    $sshTest = ssh -o ConnectTimeout=10 "$VPS_USER@$VPS_HOST" "echo 'SSH connection successful'" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection established" -ForegroundColor Green
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to VPS via SSH" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. VPS is running and accessible" -ForegroundColor Yellow
    Write-Host "2. SSH service is running on VPS" -ForegroundColor Yellow
    Write-Host "3. Your internet connection" -ForegroundColor Yellow
    Write-Host "4. Try manual connection: ssh $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting deployment process..." -ForegroundColor Blue
Write-Host "This will:" -ForegroundColor Cyan
Write-Host "1. Clone BlinkAI from GitHub" -ForegroundColor Cyan
Write-Host "2. Install dependencies" -ForegroundColor Cyan
Write-Host "3. Setup environment" -ForegroundColor Cyan
Write-Host "4. Test Hermes CLI" -ForegroundColor Cyan
Write-Host "5. Build and start application" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Create deployment script
$deployScript = @"
#!/bin/bash
set -e

echo "🚀 Starting BlinkAI deployment..."

# Update system
echo "📦 Updating system packages..."
apt update -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    apt install -y git
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check Node.js version
echo "✅ Node.js version: `$(node --version)`"
echo "✅ npm version: `$(npm --version)`"

# Check if Hermes CLI is available
if command -v hermes &> /dev/null; then
    echo "✅ Hermes CLI found: `$(hermes --version)`"
    HERMES_AVAILABLE="true"
else
    echo "⚠️  Hermes CLI not found"
    HERMES_AVAILABLE="false"
fi

# Remove existing directory if exists
if [ -d "blinkai" ]; then
    echo "🗑️  Removing existing blinkai directory..."
    rm -rf blinkai
fi

# Clone repository
echo "📥 Cloning BlinkAI from GitHub..."
git clone https://github.com/$GITHUB_REPO.git blinkai
cd blinkai

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
echo "⚙️ Setting up environment..."
cp .env.example .env

# Update .env for VPS
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://$VPS_HOST:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# AI Configuration (EDIT THESE!)
AI_API_KEY="sk-your-openai-api-key-here"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Framework
HERMES_CLI_AVAILABLE="`$HERMES_AVAILABLE"
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"

# Platform Branding
NEXT_PUBLIC_PLATFORM_NAME="HermesAI"
NEXT_PUBLIC_PLATFORM_TAGLINE="Deploy Your AI Agents in Seconds"

# Credit System
SIGNUP_CREDIT_BONUS=1000
CREDIT_COST_PER_1K_TOKENS=10
ENV_EOF

echo "✅ Environment file created"

# Test Hermes CLI if available
if [ "`$HERMES_AVAILABLE" = "true" ]; then
    echo "🧪 Testing Hermes CLI..."
    npm run test:hermes || echo "⚠️  Hermes test failed, but continuing..."
else
    echo "⚠️  Skipping Hermes test (CLI not available)"
fi

# Setup database
echo "🗄️ Setting up database..."
npm run setup

# Build application
echo "🏗️ Building application..."
npm run build

# Stop existing PM2 process if running
echo "🛑 Stopping existing processes..."
pm2 delete blinkai 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "blinkai" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup | grep -E '^sudo' | bash || true

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Application Information:"
echo "  🔗 URL: http://$VPS_HOST:3000"
echo "  📊 API Status: http://$VPS_HOST:3000/api/hermes/status"
echo "  🧪 Test Hermes: http://$VPS_HOST:3000/api/hermes/test"
echo ""
echo "🔧 Management Commands:"
echo "  📊 Status: pm2 status"
echo "  📝 Logs: pm2 logs blinkai"
echo "  🔄 Restart: pm2 restart blinkai"
echo "  🛑 Stop: pm2 stop blinkai"
echo ""
echo "⚠️  IMPORTANT: Edit .env file with your actual API keys!"
echo "  nano ~/blinkai/.env"
echo ""
pm2 status
"@

# Execute deployment on VPS
Write-Host "📤 Executing deployment on VPS..." -ForegroundColor Blue
$deployScript | ssh "$VPS_USER@$VPS_HOST" "cat > deploy-blinkai.sh && chmod +x deploy-blinkai.sh && bash deploy-blinkai.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Access Information:" -ForegroundColor Cyan
    Write-Host "  🔗 Application: http://$VPS_HOST`:3000" -ForegroundColor Cyan
    Write-Host "  📊 API Status: http://$VPS_HOST`:3000/api/hermes/status" -ForegroundColor Cyan
    Write-Host "  🧪 Test Hermes: http://$VPS_HOST`:3000/api/hermes/test" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Edit API keys: ssh $VPS_USER@$VPS_HOST 'nano blinkai/.env'" -ForegroundColor Yellow
    Write-Host "  2. Restart app: ssh $VPS_USER@$VPS_HOST 'pm2 restart blinkai'" -ForegroundColor Yellow
    Write-Host "  3. Test in browser: http://$VPS_HOST`:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 Management:" -ForegroundColor Cyan
    Write-Host "  📊 Check status: ssh $VPS_USER@$VPS_HOST 'pm2 status'" -ForegroundColor Cyan
    Write-Host "  📝 View logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs blinkai'" -ForegroundColor Cyan
    Write-Host "  🔄 Update app: ssh $VPS_USER@$VPS_HOST 'cd blinkai && git pull && npm install && npm run build && pm2 restart blinkai'" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above and try again." -ForegroundColor Yellow
}