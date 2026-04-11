# Quick Fix: ts-node Not Found

## Problem

When running deployment scripts, you get:
```
'ts-node' is not recognized as an internal or external command
```

## Solution

### Option 1: Install Dependencies (Recommended)

```bash
cd blinkai
npm install
```

This will install ts-node and all dependencies. Then run:

```bash
npm run reagent:deploy
```

### Option 2: Use npx Directly

If npm install doesn't work, use npx directly:

```bash
npx ts-node scripts/deploy-reagent-token.ts
```

### Option 3: Install ts-node Globally

```bash
npm install -g ts-node
```

Then run scripts normally.

## Verification

After installing, verify ts-node is available:

```bash
npx ts-node --version
```

Should output something like: `v10.9.2`

## Updated Commands

All npm scripts now use `npx` automatically:

```bash
npm run reagent:deploy   # Uses npx ts-node internally
npm run reagent:verify   # Uses npx ts-node internally
npm run reagent:test     # Uses npx ts-node internally
npm run reagent:all      # Runs all three
```

## What Changed

1. Added `ts-node` to `devDependencies` in `package.json`
2. Updated npm scripts to use `npx ts-node` instead of `ts-node`
3. `npx` will automatically use the locally installed ts-node

## Next Steps

After fixing:

1. Run `npm install` to install dependencies
2. Configure `.env` with your wallet keys
3. Run `npm run reagent:all` to deploy

---

**Fixed**: 2024-01-15
