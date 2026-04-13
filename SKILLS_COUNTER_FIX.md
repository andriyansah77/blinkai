# Skills Counter Fix - RESOLVED ✅

## Problem
Sidebar was showing **0 skills** despite 73 skills being installed (64 builtin + 9 local).

## Root Cause
The `parseSkillsList()` method was looking for lines starting with `│` character, but the actual Hermes CLI output format uses different box-drawing characters:
- Header rows use `┃` (heavy vertical)
- Data rows use `│` (light vertical) but NOT at the start of the line
- The parser was using `line.trim().startsWith('│')` which failed to match

## Solution
Changed the parser logic from:
```typescript
if (inTable && line.trim().startsWith('│')) {
```

To:
```typescript
if (inTable && line.includes('│')) {
```

Also removed the filter that was skipping lines containing "builtin" or "local" (which was ALL skills).

## Verification
PM2 logs now show:
```
[HermesIntegration] Parsed 73 skills from output
```

## User Action Required
**Hard refresh your browser** to see the updated skills counter:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

The sidebar Skills menu item should now display a green badge with **73**.

## Files Modified
- `blinkai/src/lib/hermes-integration.ts` (parseSkillsList method)

## Commit
- Hash: `55dfe92`
- Message: "Fix skills parser to handle Hermes table format correctly"
- Date: 2026-04-13

## Status
✅ **RESOLVED** - Parser fixed, deployed to VPS, verified in logs
