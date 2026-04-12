#!/bin/bash
# Quick fix for route.ts on VPS

ssh root@159.65.141.68 << 'ENDSSH'
cd /root/blinkai/src/app/api/hermes/skills/minting

# Replace result.gasUsed with result.gasPaid in the message
sed -i 's/result\.gasUsed/result.gasPaid/g' route.ts

# Replace i.gasUsed with i.gasFee in the history mapping
sed -i 's/i\.gasUsed/i.gasFee/g' route.ts

echo "Fixed route.ts"
cat route.ts | grep -n "gasUsed\|gasPaid\|gasFee" | head -20

ENDSSH
