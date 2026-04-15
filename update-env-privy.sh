#!/bin/bash
# Update Privy credentials in .env

cd /root/reagent

# Backup original .env
cp .env .env.backup

# Update Privy credentials
cat > /tmp/privy_update.txt << 'EOF'
NEXT_PUBLIC_PRIVY_APP_ID="cmnyhq7rx03ic0elb5rw5fimr"
PRIVY_APP_SECRET="privy_app_secret_CFX3it9nVVPrSz6rPUtxZh9stuViKQBDsyv5kGzP2r9vBmoPZ2D1Yr7RVR6Mpt3GyHZyUGjTqBpUqnf8Cpii2g8"
EOF

# Replace placeholders with actual values
sed -i 's/NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id-here"/NEXT_PUBLIC_PRIVY_APP_ID="cmnyhq7rx03ic0elb5rw5fimr"/' .env
sed -i 's|PRIVY_APP_SECRET="your-privy-app-secret-here"|PRIVY_APP_SECRET="privy_app_secret_CFX3it9nVVPrSz6rPUtxZh9stuViKQBDsyv5kGzP2r9vBmoPZ2D1Yr7RVR6Mpt3GyHZyUGjTqBpUqnf8Cpii2g8"|' .env

echo "✅ Privy credentials updated"
echo ""
echo "Verifying..."
grep "PRIVY" .env
