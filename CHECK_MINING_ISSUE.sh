#!/bin/bash

echo "=========================================="
echo "Checking Mining Issue"
echo "=========================================="

echo ""
echo "1. Check if code is deployed..."
cd /root/reagent
git log --oneline -5

echo ""
echo "2. Check PM2 status..."
pm2 status

echo ""
echo "3. Check recent logs..."
pm2 logs reagent --lines 50 --nostream

echo ""
echo "4. Check database - wallet with encrypted key..."
psql -U reagent -d reagent -c "SELECT \"userId\", \"address\", LENGTH(\"encryptedPrivateKey\") as key_len, LENGTH(\"keyIv\") as iv_len FROM \"Wallet\" LIMIT 5;"

echo ""
echo "5. Check environment variable..."
grep WALLET_ENCRYPTION_KEY /root/reagent/.env | head -c 50

echo ""
echo "6. Test API endpoint..."
curl -X GET https://reagent.eu.cc/api/wallet -H "Cookie: privy-token=test" 2>&1 | head -20

echo ""
echo "=========================================="
echo "Check Complete"
echo "=========================================="
