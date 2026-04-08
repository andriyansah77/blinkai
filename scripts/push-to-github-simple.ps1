# Simple GitHub Push Script for ReAgent
param(
    [string]$Token = ""
)

$Username = "andriyansah77"
$RepoName = "blinkai"

Write-Host "[INFO] Starting GitHub push..." -ForegroundColor Blue
Write-Host "[INFO] Username: $Username" -ForegroundColor Blue
Write-Host "[INFO] Repository: $RepoName" -ForegroundColor Blue

# Clear credentials
Write-Host "[INFO] Clearing Git credentials..." -ForegroundColor Blue
git config --global --unset credential.helper 2>$null
git config --system --unset credential.helper 2>$null
git config --local --unset credential.helper 2>$null

# Set Git config
Write-Host "[INFO] Setting Git configuration..." -ForegroundColor Blue
git config --global user.name $Username
git config --global user.email "$Username@gmail.com"

# Add and commit changes
Write-Host "[INFO] Adding and committing changes..." -ForegroundColor Blue
git add .

$commitMessage = "Update ReAgent: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

# Setup remote
Write-Host "[INFO] Setting up remote repository..." -ForegroundColor Blue
$remoteUrl = "https://github.com/$Username/$RepoName.git"

# Remove existing remote if exists
git remote remove origin 2>$null

# Add remote
git remote add origin $remoteUrl

# Set main branch
git branch -M main

# Push with authentication
Write-Host "[INFO] Pushing to GitHub..." -ForegroundColor Blue

if ($Token) {
    Write-Host "[INFO] Using provided token..." -ForegroundColor Blue
    
    # Create URL with token
    $tokenUrl = "https://$Username`:$Token@github.com/$Username/$RepoName.git"
    git remote set-url origin $tokenUrl
    
    # Push
    try {
        git push -u origin main
        Write-Host "[SUCCESS] Successfully pushed to GitHub!" -ForegroundColor Green
        
        # Clean up token from URL
        git remote set-url origin $remoteUrl
        Write-Host "[INFO] Token cleaned from remote URL" -ForegroundColor Blue
        
    } catch {
        Write-Host "[ERROR] Push failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "[WARNING] No token provided" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get Personal Access Token from: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "Select scopes: repo, workflow" -ForegroundColor Cyan
    Write-Host ""
    
    $userToken = Read-Host "Enter your Personal Access Token"
    
    if ($userToken) {
        # Create URL with token
        $tokenUrl = "https://$Username`:$userToken@github.com/$Username/$RepoName.git"
        git remote set-url origin $tokenUrl
        
        # Push
        try {
            git push -u origin main
            Write-Host "[SUCCESS] Successfully pushed to GitHub!" -ForegroundColor Green
            
            # Clean up token
            git remote set-url origin $remoteUrl
            
        } catch {
            Write-Host "[ERROR] Push failed: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] Token is required" -ForegroundColor Red
        exit 1
    }
}

# Show success info
Write-Host ""
Write-Host "Repository URL: https://github.com/$Username/$RepoName" -ForegroundColor Cyan
Write-Host "Clone URL: git clone https://github.com/$Username/$RepoName.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] ReAgent pushed to GitHub successfully!" -ForegroundColor Green