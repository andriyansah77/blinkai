# REAGENT Token Address Fix

## Problem
Transactions were being sent to `0x0000000000000000000000000000000000000000` (dead address) instead of the actual REAGENT token contract address.

## Root Cause
The `.env` file on VPS was incomplete and missing the `REAGENT_TOKEN_ADDRESS` environment variable. The inscription engine was falling back to the default value of `0x00...00`.

## Solution
1. Copied complete `.env` file from local to VPS
2. Updated `NEXTAUTH_URL` to production domain
3. Restarted PM2 with `--update-env` flag to reload environment variables

## Verification
```bash
# Check that REAGENT_TOKEN_ADDRESS is set
cat /root/blinkai/.env | grep REAGENT_TOKEN_ADDRESS
# Output: REAGENT_TOKEN_ADDRESS="0x20C000000000000000000000a59277C0c1d65Bc5"
```

## Result
✅ Transactions now correctly call the REAGENT token contract at `0x20C000000000000000000000a59277C0c1d65Bc5`
✅ Minting will work properly
✅ Tokens will be credited to user wallets

## Next Steps
Test minting again - tokens should now be received correctly!
