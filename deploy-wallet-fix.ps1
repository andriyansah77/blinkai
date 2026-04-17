# Deploy wallet decryption fix to VPS
# Run this script to deploy the latest changes

Write-Host "Deploying wallet decryption fix to VPS..." -ForegroundColor Green

# SSH commands
$commands = @(
    "cd /root/reagent",
    "git pull origin main",
    "npm run build",
    "chmod +x /root/reagent/hermes-skills/reagent_wallet_curl.sh",
    "pm2 restart reagent --update-env",
    "pm2 logs reagent --lines 50"
)

# Execute via SSH
ssh root@188.166.247.252 ($commands -join ' && ')
