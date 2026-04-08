# 🚀 ReAgent VPS Deployment Script (PowerShell)
# Script otomatis untuk deploy ReAgent ke VPS dari Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsUser,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [int]$VpsPort = 22,
    
    [string]$AppDir = "",
    
    [switch]$Help
)

# Colors for output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show usage
function Show-Usage {
    Write-Host "Usage: .\deploy-to-vps.ps1 -VpsUser <user> -VpsHost <host> [options]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -VpsUser <user>     VPS username (required)"
    Write-Host "  -VpsHost <host>     VPS IP address or domain (required)"
    Write-Host "  -VpsPort <port>     SSH port (default: 22)"
    Write-Host "  -AppDir <dir>       Remote directory (default: /home/user/reagent)"
    Write-Host "  -Help               Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy-to-vps.ps1 -VpsUser root -VpsHost 192.168.1.100"
    Write-Host "  .\deploy-to-vps.ps1 -VpsUser ubuntu -VpsHost mydomain.com -VpsPort 2222"
}

if ($Help) {
    Show-Usage
    exit 0
}

if (-not $VpsUser -or -not $VpsHost) {
    Write-Error "VPS user and host are required!"
    Show-Usage
    exit 1
}

if (-not $AppDir) {
    $AppDir = "/home/$VpsUser/reagent"
}

Write-Status "🚀 Starting ReAgent deployment to VPS..."
Write-Status "Target: $VpsUser@$VpsHost`:$VpsPort"
Write-Status "Directory: $AppDir"

# Check if SSH client is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH client not found!"
    Write-Error "Please install OpenSSH client or use WSL"
    exit 1
}

# Check if SCP is available
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Error "SCP not found!"
    Write-Error "Please install OpenSSH client or use WSL"
    exit 1
}

# Test SSH connection
Write-Status "📡 Testing SSH connection..."
try {
    $sshTest = ssh -p $VpsPort -o ConnectTimeout=10 "$VpsUser@$VpsHost" "echo 'SSH connection successful'" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SSH connection established"
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Error "Cannot connect to VPS via SSH"
    Write-Error "Please check your credentials and network connection"
    exit 1
}

# Create deployment package
Write-Status "📦 Creating deployment package..."
$tempDir = [System.IO.Path]::GetTempPath()
$packagePath = Join-Path $tempDir "reagent-deploy.zip"

# Remove old package if exists
if (Test-Path $packagePath) {
    Remove-Item $packagePath -Force
}

# Create zip package excluding unnecessary files
$excludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "prisma\dev.db",
    ".env",
    "*.zip",
    "*.tar.gz"
)

Write-Status "Creating zip package (excluding: $($excludePatterns -join ', '))..."

# Use PowerShell compression
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($packagePath, 'Create')

Get-ChildItem -Path . -Recurse | Where-Object {
    $file = $_
    $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
    
    # Check if file should be excluded
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    return -not $shouldExclude -and -not $file.PSIsContainer
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $relativePath = $relativePath.Replace('\', '/')
    
    $entry = $zip.CreateEntry($relativePath, $compressionLevel)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($_.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Close()
    $entryStream.Close()
}

$zip.Dispose()
Write-Success "Package created: $packagePath"

# Upload package to VPS
Write-Status "📤 Uploading package to VPS..."
scp -P $VpsPort $packagePath "$VpsUser@$VpsHost`:~/reagent-deploy.zip"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload package"
    exit 1
}

Write-Success "Package uploaded successfully"

# Deploy on VPS
Write-Status "🚀 Deploying application on VPS..."
$deployScript = @"
#!/bin/bash
set -e

echo "📁 Creating application directory..."
mkdir -p $AppDir
cd $AppDir

echo "📦 Extracting package..."
if [ -f ~/reagent-deploy.zip ]; then
    unzip -o ~/reagent-deploy.zip
    rm ~/reagent-deploy.zip
else
    echo "❌ Package not found"
    exit 1
fi

echo "🔍 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

if ! command -v hermes &> /dev/null; then
    echo "❌ Hermes CLI not found"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

echo "🧪 Testing Hermes CLI..."
npm run test:hermes || echo "⚠️  Hermes test failed, check configuration"

echo "🗄️ Setting up database..."
npm run setup

echo "🏗️ Building application..."
npm run build

echo "🔧 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "🚀 Starting application..."
pm2 delete reagent 2>/dev/null || true
pm2 start npm --name "reagent" -- start
pm2 save
pm2 startup | grep -E '^sudo' | bash || true

echo "✅ Deployment completed successfully!"
pm2 status
"@

# Write deploy script to temp file and execute
$deployScriptPath = "/tmp/deploy-reagent.sh"
$deployScript | ssh -p $VpsPort "$VpsUser@$VpsHost" "cat > $deployScriptPath && chmod +x $deployScriptPath && bash $deployScriptPath"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

# Cleanup
Remove-Item $packagePath -Force

# Show success information
Write-Success "🎉 ReAgent deployment completed successfully!"
Write-Host ""
Write-Host "📋 Access Information:" -ForegroundColor Cyan
Write-Host "  🔗 Application URL: http://$VpsHost`:3000"
Write-Host "  📊 API Status: http://$VpsHost`:3000/api/hermes/status"
Write-Host "  🧪 Test Hermes: http://$VpsHost`:3000/api/hermes/test"
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "  📊 Check status: ssh -p $VpsPort $VpsUser@$VpsHost 'pm2 status'"
Write-Host "  📝 View logs: ssh -p $VpsPort $VpsUser@$VpsHost 'pm2 logs reagent'"
Write-Host "  🔄 Restart app: ssh -p $VpsPort $VpsUser@$VpsHost 'pm2 restart reagent'"
Write-Host "  🛑 Stop app: ssh -p $VpsPort $VpsUser@$VpsHost 'pm2 stop reagent'"
Write-Host ""
Write-Host "⚠️  Important Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Edit .env file on VPS with your API keys"
Write-Host "  2. Configure domain/SSL if needed"
Write-Host "  3. Setup firewall rules for port 3000"
Write-Host "  4. Test the application in browser"