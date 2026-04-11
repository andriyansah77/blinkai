# ✅ REAGENT Token Deployment Checklist

Copy checklist ini dan check setiap item sebelum deployment.

---

## 📋 Pre-Deployment Checklist

### Environment Configuration
- [ ] Opened `.env` file
- [ ] Found `QUOTE_TOKEN_ADDRESS` line
- [ ] Visited https://explorer.tempo.xyz
- [ ] Searched for USDT/USDC/PATHUSD
- [ ] Copied token address
- [ ] Updated `QUOTE_TOKEN_ADDRESS="0x..."`
- [ ] Generated 32-char encryption key
- [ ] Updated `WALLET_ENCRYPTION_KEY="..."`
- [ ] Saved `.env` file
- [ ] Verified `TEMPO_RPC_URL="https://rpc.tempo.xyz"`
- [ ] Verified `TEMPO_CHAIN_ID="4217"`

### Tempo CLI Setup
- [ ] Opened terminal/PowerShell
- [ ] Ran: `curl -L https://tempo.xyz/install | bash`
- [ ] Restarted terminal (or ran `source ~/.bashrc`)
- [ ] Ran: `tempo --version` (should show version)
- [ ] Ran: `tempo wallet login` (browser opened)
- [ ] Completed login in browser
- [ ] Ran: `tempo wallet status` (should show "logged in")
- [ ] Ran: `tempo wallet address` (got wallet address)
- [ ] Copied wallet address

### Wallet Funding
- [ ] Have stablecoins ready (~0.05 ETH equivalent)
- [ ] Sent stablecoins to wallet address
- [ ] Waited for transaction confirmation
- [ ] Ran: `tempo wallet balances`
- [ ] Confirmed balance shows sufficient funds
- [ ] Balance > 0.05 ETH equivalent

### Final Verification
- [ ] Read `PRODUCTION_DEPLOYMENT_READY.md`
- [ ] Understood this is MAINNET deployment
- [ ] Understood actions are IRREVERSIBLE
- [ ] Have backup plan ready
- [ ] Team notified about deployment
- [ ] Ready to monitor after deployment

---

## 🚀 Deployment Steps

### Execute Deployment
- [ ] Opened terminal in project directory
- [ ] Ran: `npm run reagent:deploy:production`
- [ ] Saw pre-flight checks (all passed)
- [ ] Saw warning about MAINNET
- [ ] Typed "yes" when prompted
- [ ] Reviewed deployment configuration
- [ ] Typed "DEPLOY TO MAINNET" when prompted
- [ ] Saw "Deploying..." message
- [ ] Waited for deployment to complete
- [ ] Saw "PRODUCTION DEPLOYMENT SUCCESSFUL" message
- [ ] Copied token address from output
- [ ] Copied Explorer link from output

---

## ✅ Post-Deployment Verification

### Immediate Checks
- [ ] Opened Explorer link in browser
- [ ] Verified token name: "ReAgent Token"
- [ ] Verified token symbol: "REAGENT"
- [ ] Verified decimals: 6
- [ ] Saw deployment transaction
- [ ] Transaction status: Success

### File Verification
- [ ] Checked `.env` file
- [ ] Confirmed `REAGENT_TOKEN_ADDRESS` updated
- [ ] Checked `REAGENT_MAINNET_DEPLOYMENT.json` exists
- [ ] Opened deployment JSON file
- [ ] Verified all details correct

### Functional Testing
- [ ] Ran: `npm run reagent:verify`
- [ ] Verification passed
- [ ] Ran: `npm run reagent:test`
- [ ] Test minting successful
- [ ] Checked minted amount correct (10,000 REAGENT)

### Documentation
- [ ] Saved token address to secure location
- [ ] Saved deployment JSON to backup
- [ ] Updated team documentation
- [ ] Announced deployment to team
- [ ] Scheduled 24-hour monitoring

---

## 📊 Deployment Info to Record

Fill this out after deployment:

```
Deployment Date: _______________
Deployment Time: _______________
Token Address: 0x_______________
Admin Address: 0x_______________
Platform Wallet: 0x_______________
Quote Token: 0x_______________
Explorer Link: https://explorer.tempo.xyz/address/0x_______________
Deployment TX: 0x_______________
```

---

## 🎯 Next Steps

- [ ] Monitor token for 24 hours
- [ ] Test minting from platform
- [ ] Verify gas costs
- [ ] Check token liquidity
- [ ] Proceed to Phase 3 implementation
- [ ] Update project documentation
- [ ] Announce to users (if applicable)

---

## 🆘 Emergency Contacts

If something goes wrong:

1. **DO NOT PANIC**
2. Document the error
3. Check transaction on Explorer
4. Review deployment logs
5. Contact Tempo support if needed

**Tempo Support:**
- Docs: https://docs.tempo.xyz
- Discord: (check docs for invite)
- Explorer: https://explorer.tempo.xyz

---

## ✅ Completion

- [ ] All checklist items completed
- [ ] Deployment successful
- [ ] Verification passed
- [ ] Documentation updated
- [ ] Team notified
- [ ] Ready for Phase 3

**Deployment Status:** ⏳ Pending / ✅ Complete / ❌ Failed

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Date Completed:** _______________
**Completed By:** _______________
**Signature:** _______________
