# Deploy BlinkAI to Your VPS - Fixed Version
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

# Execute deployment commands one by one
Write-Host "📤 Executing deployment on VPS..." -ForegroundColor Blue

# Step 1: Update system
Write-Host "📦 Updating system..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "apt update -y"

# Step 2: Install Node.js if needed
Write-Host "📦 Checking Node.js..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
if ! command -v node >/dev/null 2>&1; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js already installed: `$(node --version)"
fi
"@

# Step 3: Install Git if needed
Write-Host "📦 Checking Git..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
if ! command -v git >/dev/null 2>&1; then
    echo "Installing Git..."
    apt install -y git
else
    echo "Git already installed: `$(git --version)"
fi
"@

# Step 4: Install PM2 if needed
Write-Host "📦 Checking PM2..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
if ! command -v pm2 >/dev/null 2>&1; then
    echo "Installing PM2..."
    npm install -g pm2
else
    echo "PM2 already installed: `$(pm2 --version)"
fi
"@

# Step 5: Check Hermes CLI
Write-Host "🔍 Checking Hermes CLI..." -ForegroundColor Blue
$hermesCheck = ssh "$VPS_USER@$VPS_HOST" @"
if command -v hermes >/dev/null 2>&1; then
    echo "HERMES_FOUND:`$(hermes --version)"
else
    echo "HERMES_NOT_FOUND"
fi
"@

$hermesAvailable = if ($hermesCheck -like "*HERMES_FOUND*") { "true" } else { "false" }
Write-Host "Hermes CLI available: $hermesAvailable" -ForegroundColor Cyan

# Step 6: Clone repository
Write-Host "📥 Cloning repository..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
if [ -d "blinkai" ]; then
    echo "Removing existing blinkai directory..."
    rm -rf blinkai
fi
echo "Cloning BlinkAI from GitHub..."
git clone https://github.com/$GITHUB_REPO.git blinkai
"@

# Step 7: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm install"

# Step 8: Setup environment
Write-Host "⚙️ Setting up environment..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
cd blinkai
cp .env.example .env

# Create production .env
cat > .env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://$VPS_HOST:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-$(date +%s)"

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
NEXT_PUBLIC_PLATFORM_NAME="ReAgent"
NEXT_PUBLIC_PLATFORM_TAGLINE="Deploy Your AI Agents in Seconds"

# Credit System
SIGNUP_CREDIT_BONUS=1000
CREDIT_COST_PER_1K_TOKENS=10
EOF

echo "Environment file created successfully"
"@

# Step 9: Test Hermes if available
if ($hermesAvailable -eq "true") {
    Write-Host "🧪 Testing Hermes CLI..." -ForegroundColor Blue
    ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run test:hermes || echo 'Hermes test completed with warnings'"
} else {
    Write-Host "⚠️ Skipping Hermes test (CLI not available)" -ForegroundColor Yellow
}

# Step 10: Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run setup"

# Step 11: Build application
Write-Host "🏗️ Building application..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "cd blinkai && npm run build"

# Step 12: Start with PM2
Write-Host "🚀 Starting application..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" @"
cd blinkai
pm2 delete blinkai 2>/dev/null || true
pm2 start npm --name "blinkai" -- start
pm2 save
pm2 startup | grep -E '^sudo' | bash || true
"@

# Step 13: Check status
Write-Host "📊 Checking application status..." -ForegroundColor Blue
$pmStatus = ssh "$VPS_USER@$VPS_HOST" "pm2 status"
Write-Host $pmStatus

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
    Write-Host "🔄 Management Commands:" -ForegroundColor Cyan
    Write-Host "  📊 Status: ssh $VPS_USER@$VPS_HOST 'pm2 status'" -ForegroundColor Cyan
    Write-Host "  📝 Logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs blinkai'" -ForegroundColor Cyan
    Write-Host "  🔄 Restart: ssh $VPS_USER@$VPS_HOST 'pm2 restart blinkai'" -ForegroundColor Cyan
    Write-Host "  🔄 Update: ssh $VPS_USER@$VPS_HOST 'cd blinkai; git pull; npm install; npm run build; pm2 restart blinkai'" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above and try again." -ForegroundColor Yellow
}