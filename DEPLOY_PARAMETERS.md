# 🚀 REAGENT Token Deployment Parameters

## ✅ Updated Parameters (Ready to Use)

### Contract Address
```
TIP20Factory: 0x20Fc000000000000000000000000000000000000
```

### Function
```
createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt)
```

### Parameters (Copy-Paste Ready)

```
1. name (string):
ReAgent Token

2. symbol (string):
REAGENT

3. currency (string):
USD

4. quoteToken (address):
0x20c0000000000000000000000000000000000000

5. admin (address):
0xbd6d0CC8F02f7A961b02cC451998748e761cDffE

6. salt (bytes32):
0x72656167656e742d313737353835343933302d37373834333900000000000000
```

---

## 📋 Parameter Details

### Admin Address
```
0xbd6d0CC8F02f7A961b02cC451998748e761cDffE
```
- **Role**: Token owner & admin
- **Permissions**: Can grant roles, set supply cap, pause token
- **Important**: This address will be the DEFAULT_ADMIN_ROLE

### Quote Token (pathUSD)
```
0x20c0000000000000000000000000000000000000
```
- **Token**: pathUSD (Tempo native stablecoin)
- **Purpose**: Quote token for DEX trading pairs
- **Price**: $1.00 USD

### Salt
```
String: reagent-1775854930-778439
Bytes32: 0x72656167656e742d313737353835343933302d37373834333900000000000000
```
- **Purpose**: Unique identifier for deterministic address
- **Generated**: Timestamp + Random number
- **Unique**: Yes, never used before

---

## 🎯 Deployment Steps

### Step 1: Open Tempo Explorer
```
https://explore.tempo.xyz/address/0x20Fc000000000000000000000000000000000000
```

### Step 2: Connect Wallet
1. Click "Write Contract" tab
2. Click "Connect Wallet"
3. Approve connection

### Step 3: Find createToken Function
Scroll down to find `createToken` function

### Step 4: Fill Parameters
Copy-paste each parameter from above:
- name: `ReAgent Token`
- symbol: `REAGENT`
- currency: `USD`
- quoteToken: `0x20c0000000000000000000000000000000000000`
- admin: `0xbd6d0CC8F02f7A961b02cC451998748e761cDffE`
- salt: `0x72656167656e742d313737353835343933302d37373834333900000000000000`

### Step 5: Send Transaction
1. Click "Write" button
2. Review gas estimate
3. Confirm in wallet
4. Wait for confirmation

### Step 6: Get Token Address
After transaction confirmed:
1. Click on transaction hash
2. Go to "Logs" tab
3. Find "TokenCreated" event
4. Copy token address

---

## 🔐 Post-Deployment: Grant ISSUER_ROLE

### Parameters for grantRole
```
Function: grantRole(bytes32 role, address account)

role (bytes32):
0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122

account (address):
0xbd6d0CC8F02f7A961b02cC451998748e761cDffE
```

**Note**: Grant ISSUER_ROLE to admin address so it can mint tokens.

---

## 📊 Post-Deployment: Set Supply Cap

### Parameters for setSupplyCap
```
Function: setSupplyCap(uint256 cap)

cap (uint256):
400000000000000
```

**Explanation**: 400M REAGENT with 6 decimals = 400,000,000 × 10^6

---

## ✅ Verification Checklist

After deployment:
- [ ] Token deployed successfully
- [ ] Token address obtained: `0x...`
- [ ] Name verified: "ReAgent Token"
- [ ] Symbol verified: "REAGENT"
- [ ] Decimals verified: 6
- [ ] Admin verified: `0xbd6d0CC8F02f7A961b02cC451998748e761cDffE`
- [ ] ISSUER_ROLE granted
- [ ] Supply cap set to 400M
- [ ] Token visible on Explorer

---

## 🔗 Quick Links

- **Tempo Explorer**: https://explore.tempo.xyz
- **TIP20Factory**: https://explore.tempo.xyz/address/0x20Fc000000000000000000000000000000000000
- **pathUSD**: https://explore.tempo.xyz/address/0x20c0000000000000000000000000000000000000
- **Admin Wallet**: https://explore.tempo.xyz/address/0xbd6d0CC8F02f7A961b02cC451998748e761cDffE

---

## 📝 Save This Info

After deployment, save:
```json
{
  "network": "tempo-mainnet",
  "chainId": 4217,
  "tokenAddress": "0x...", // Fill after deployment
  "tokenName": "ReAgent Token",
  "tokenSymbol": "REAGENT",
  "decimals": 6,
  "adminAddress": "0xbd6d0CC8F02f7A961b02cC451998748e761cDffE",
  "quoteToken": "0x20c0000000000000000000000000000000000000",
  "salt": "0x72656167656e742d313737353835343933302d37373834333900000000000000",
  "deployedAt": "2024-XX-XX",
  "txHash": "0x..." // Fill after deployment
}
```

---

**Status**: ✅ Ready to Deploy
**Admin**: 0xbd6d0CC8F02f7A961b02cC451998748e761cDffE
**Salt**: New & Unique
**Network**: Tempo Mainnet

🚀 **Ready to deploy!**
