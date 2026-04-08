# 🚀 ReAgent GitHub Push Script (PowerShell)
# Script otomatis untuk push project ke GitHub dengan authentication

param(
    [string]$Username = "andriyansah77",
    [string]$RepoName = "blinkai",
    [string]$Token = "",
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
    Write-Host "Usage: .\push-to-github.ps1 [options]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -Username <user>    GitHub username (default: andriyansah77)"
    Write-Host "  -RepoName <repo>    Repository name (default: blinkai)"
    Write-Host "  -Token <token>      Personal Access Token (optional)"
    Write-Host "  -Help               Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\push-to-github.ps1"
    Write-Host "  .\push-to-github.ps1 -Token ghp_xxxxxxxxxxxx"
    Write-Host "  .\push-to-github.ps1 -Username myuser -RepoName myrepo"
}

if ($Help) {
    Show-Usage
    exit 0
}

Write-Status "🚀 Starting GitHub push process..."
Write-Status "Username: $Username"
Write-Status "Repository: $RepoName"

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not a git repository! Please run this script from the project root."
    exit 1
}

# Step 1: Clear existing credentials
Write-Status "🔧 Clearing existing Git credentials..."
try {
    git config --global --unset credential.helper 2>$null
    git config --system --unset credential.helper 2>$null
    git config --local --unset credential.helper 2>$null
    Write-Success "Credentials cleared"
} catch {
    Write-Warning "Some credentials couldn't be cleared (this is normal)"
}

# Step 2: Set Git configuration
Write-Status "⚙️ Setting Git configuration..."
git config --global user.name $Username
git config --global user.email "$Username@gmail.com"
Write-Success "Git config updated"

# Step 3: Check git status
Write-Status "📋 Checking git status..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Status "Found uncommitted changes, adding them..."
    git add .
    
    # Commit if there are staged changes
    $stagedFiles = git diff --cached --name-only
    if ($stagedFiles) {
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        git commit -m $commitMessage
        Write-Success "Changes committed: $commitMessage"
    }
} else {
    Write-Status "No uncommitted changes found"
}

# Step 4: Handle remote repository
Write-Status "🔗 Setting up remote repository..."
$remoteUrl = "https://github.com/$Username/$RepoName.git"

# Check if remote exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Status "Remote 'origin' already exists: $existingRemote"
    
    # Update remote URL if different
    if ($existingRemote -ne $remoteUrl) {
        git remote set-url origin $remoteUrl
        Write-Success "Remote URL updated to: $remoteUrl"
    }
} else {
    git remote add origin $remoteUrl
    Write-Success "Remote 'origin' added: $remoteUrl"
}

# Step 5: Set main branch
Write-Status "🌿 Setting up main branch..."
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    git branch -M main
    Write-Success "Branch renamed to 'main'"
}

# Step 6: Handle authentication
Write-Status "🔐 Setting up authentication..."

if ($Token) {
    Write-Status "Using provided Personal Access Token..."
    
    # Update remote URL with token
    $tokenUrl = "https://$Username`:$Token@github.com/$Username/$RepoName.git"
    git remote set-url origin $tokenUrl
    Write-Success "Remote URL updated with token"
    
    # Push with token
    Write-Status "📤 Pushing to GitHub with token..."
    try {
        git push -u origin main
        Write-Success "🎉 Successfully pushed to GitHub!"
        
        # Clean up token from remote URL for security
        git remote set-url origin $remoteUrl
        Write-Status "Token removed from remote URL for security"
        
    } catch {
        Write-Error "Push failed with token: $($_.Exception.Message)"
        exit 1
    }
    
} else {
    Write-Warning "No token provided. You'll need to authenticate manually."
    Write-Host ""
    Write-Host "📋 To get a Personal Access Token:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/settings/tokens"
    Write-Host "2. Click 'Generate new token (classic)'"
    Write-Host "3. Select scopes: 'repo' and 'workflow'"
    Write-Host "4. Copy the generated token"
    Write-Host ""
    
    $userToken = Read-Host "Enter your Personal Access Token (or press Enter to authenticate manually)"
    
    if ($userToken) {
        Write-Status "Using entered token..."
        
        # Update remote URL with token
        $tokenUrl = "https://$Username`:$userToken@github.com/$Username/$RepoName.git"
        git remote set-url origin $tokenUrl
        
        # Push with token
        Write-Status "📤 Pushing to GitHub..."
        try {
            git push -u origin main
            Write-Success "🎉 Successfully pushed to GitHub!"
            
            # Clean up token from remote URL
            git remote set-url origin $remoteUrl
            Write-Status "Token removed from remote URL for security"
            
        } catch {
            Write-Error "Push failed: $($_.Exception.Message)"
            exit 1
        }
        
    } else {
        Write-Status "📤 Attempting manual authentication..."
        Write-Host "When prompted, enter:" -ForegroundColor Yellow
        Write-Host "  Username: $Username"
        Write-Host "  Password: [Your Personal Access Token]"
        Write-Host ""
        
        try {
            git push -u origin main
            Write-Success "🎉 Successfully pushed to GitHub!"
        } catch {
            Write-Error "Push failed. Please check your credentials."
            Write-Host ""
            Write-Host "💡 Troubleshooting:" -ForegroundColor Cyan
            Write-Host "1. Make sure you created the repository: https://github.com/$Username/$RepoName"
            Write-Host "2. Use Personal Access Token as password, not your GitHub password"
            Write-Host "3. Check token permissions (repo, workflow)"
            Write-Host "4. Try running the script with -Token parameter"
            exit 1
        }
    }
}

# Step 7: Verify push
Write-Status "🔍 Verifying push..."
try {
    $remoteCommit = git ls-remote origin main
    if ($remoteCommit) {
        Write-Success "✅ Push verified successfully!"
    } else {
        Write-Warning "Could not verify remote commit"
    }
} catch {
    Write-Warning "Could not verify push, but it might have succeeded"
}

# Step 8: Show success information
Write-Success "🎉 GitHub push completed!"
Write-Host ""
Write-Host "📋 Repository Information:" -ForegroundColor Cyan
Write-Host "  🔗 Repository URL: https://github.com/$Username/$RepoName"
Write-Host "  📊 Repository API: https://api.github.com/repos/$Username/$RepoName"
Write-Host "  📥 Clone URL: git clone https://github.com/$Username/$RepoName.git"
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Visit your repository: https://github.com/$Username/$RepoName"
Write-Host "  2. Check if all files are uploaded correctly"
Write-Host "  3. Setup GitHub Actions (if needed)"
Write-Host "  4. Deploy to VPS using: npm run deploy:github"
Write-Host ""
Write-Host "🔄 Future Updates:" -ForegroundColor Cyan
Write-Host "  git add ."
Write-Host "  git commit -m 'Update description'"
Write-Host "  git push origin main"
Write-Host ""
Write-Success "ReAgent successfully pushed to GitHub!"