#!/bin/bash

# 🚀 BlinkAI GitHub Push Script (Bash)
# Script otomatis untuk push project ke GitHub dengan authentication

set -e

# Default values
USERNAME="andriyansah77"
REPO_NAME="blinkai"
TOKEN=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --username USER   GitHub username (default: andriyansah77)"
    echo "  -r, --repo REPO       Repository name (default: blinkai)"
    echo "  -t, --token TOKEN     Personal Access Token (optional)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 -t ghp_xxxxxxxxxxxx"
    echo "  $0 -u myuser -r myrepo"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--username)
            USERNAME="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_NAME="$2"
            shift 2
            ;;
        -t|--token)
            TOKEN="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

print_status "🚀 Starting GitHub push process..."
print_status "Username: $USERNAME"
print_status "Repository: $REPO_NAME"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository! Please run this script from the project root."
    exit 1
fi

# Step 1: Clear existing credentials
print_status "🔧 Clearing existing Git credentials..."
git config --global --unset credential.helper 2>/dev/null || true
git config --system --unset credential.helper 2>/dev/null || true
git config --local --unset credential.helper 2>/dev/null || true
print_success "Credentials cleared"

# Step 2: Set Git configuration
print_status "⚙️ Setting Git configuration..."
git config --global user.name "$USERNAME"
git config --global user.email "$USERNAME@gmail.com"
print_success "Git config updated"

# Step 3: Check git status
print_status "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_status "Found uncommitted changes, adding them..."
    git add .
    
    # Commit if there are staged changes
    if [ -n "$(git diff --cached --name-only)" ]; then
        COMMIT_MESSAGE="Update: $(date '+%Y-%m-%d %H:%M')"
        git commit -m "$COMMIT_MESSAGE"
        print_success "Changes committed: $COMMIT_MESSAGE"
    fi
else
    print_status "No uncommitted changes found"
fi

# Step 4: Handle remote repository
print_status "🔗 Setting up remote repository..."
REMOTE_URL="https://github.com/$USERNAME/$REPO_NAME.git"

# Check if remote exists
if git remote get-url origin >/dev/null 2>&1; then
    EXISTING_REMOTE=$(git remote get-url origin)
    print_status "Remote 'origin' already exists: $EXISTING_REMOTE"
    
    # Update remote URL if different
    if [ "$EXISTING_REMOTE" != "$REMOTE_URL" ]; then
        git remote set-url origin "$REMOTE_URL"
        print_success "Remote URL updated to: $REMOTE_URL"
    fi
else
    git remote add origin "$REMOTE_URL"
    print_success "Remote 'origin' added: $REMOTE_URL"
fi

# Step 5: Set main branch
print_status "🌿 Setting up main branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
    print_success "Branch renamed to 'main'"
fi

# Step 6: Handle authentication
print_status "🔐 Setting up authentication..."

if [ -n "$TOKEN" ]; then
    print_status "Using provided Personal Access Token..."
    
    # Update remote URL with token
    TOKEN_URL="https://$USERNAME:$TOKEN@github.com/$USERNAME/$REPO_NAME.git"
    git remote set-url origin "$TOKEN_URL"
    print_success "Remote URL updated with token"
    
    # Push with token
    print_status "📤 Pushing to GitHub with token..."
    if git push -u origin main; then
        print_success "🎉 Successfully pushed to GitHub!"
        
        # Clean up token from remote URL for security
        git remote set-url origin "$REMOTE_URL"
        print_status "Token removed from remote URL for security"
    else
        print_error "Push failed with token"
        exit 1
    fi
    
else
    print_warning "No token provided. You'll need to authenticate manually."
    echo ""
    echo -e "${CYAN}📋 To get a Personal Access Token:${NC}"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select scopes: 'repo' and 'workflow'"
    echo "4. Copy the generated token"
    echo ""
    
    read -p "Enter your Personal Access Token (or press Enter to authenticate manually): " USER_TOKEN
    
    if [ -n "$USER_TOKEN" ]; then
        print_status "Using entered token..."
        
        # Update remote URL with token
        TOKEN_URL="https://$USERNAME:$USER_TOKEN@github.com/$USERNAME/$REPO_NAME.git"
        git remote set-url origin "$TOKEN_URL"
        
        # Push with token
        print_status "📤 Pushing to GitHub..."
        if git push -u origin main; then
            print_success "🎉 Successfully pushed to GitHub!"
            
            # Clean up token from remote URL
            git remote set-url origin "$REMOTE_URL"
            print_status "Token removed from remote URL for security"
        else
            print_error "Push failed"
            exit 1
        fi
        
    else
        print_status "📤 Attempting manual authentication..."
        echo -e "${YELLOW}When prompted, enter:${NC}"
        echo "  Username: $USERNAME"
        echo "  Password: [Your Personal Access Token]"
        echo ""
        
        if git push -u origin main; then
            print_success "🎉 Successfully pushed to GitHub!"
        else
            print_error "Push failed. Please check your credentials."
            echo ""
            echo -e "${CYAN}💡 Troubleshooting:${NC}"
            echo "1. Make sure you created the repository: https://github.com/$USERNAME/$REPO_NAME"
            echo "2. Use Personal Access Token as password, not your GitHub password"
            echo "3. Check token permissions (repo, workflow)"
            echo "4. Try running the script with -t parameter"
            exit 1
        fi
    fi
fi

# Step 7: Verify push
print_status "🔍 Verifying push..."
if git ls-remote origin main >/dev/null 2>&1; then
    print_success "✅ Push verified successfully!"
else
    print_warning "Could not verify push, but it might have succeeded"
fi

# Step 8: Show success information
print_success "🎉 GitHub push completed!"
echo ""
echo -e "${CYAN}📋 Repository Information:${NC}"
echo "  🔗 Repository URL: https://github.com/$USERNAME/$REPO_NAME"
echo "  📊 Repository API: https://api.github.com/repos/$USERNAME/$REPO_NAME"
echo "  📥 Clone URL: git clone https://github.com/$USERNAME/$REPO_NAME.git"
echo ""
echo -e "${CYAN}🚀 Next Steps:${NC}"
echo "  1. Visit your repository: https://github.com/$USERNAME/$REPO_NAME"
echo "  2. Check if all files are uploaded correctly"
echo "  3. Setup GitHub Actions (if needed)"
echo "  4. Deploy to VPS using: npm run deploy:github"
echo ""
echo -e "${CYAN}🔄 Future Updates:${NC}"
echo "  git add ."
echo "  git commit -m 'Update description'"
echo "  git push origin main"
echo ""
print_success "✅ BlinkAI successfully pushed to GitHub!"