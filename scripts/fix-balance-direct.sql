-- Fix corrupted PATHUSD balance
UPDATE "Wallet" 
SET "pathusdBalance" = '0', 
    "lastBalanceUpdate" = '2020-01-01'
WHERE "userId" = 'did:privy:cmo2x9m4g00zz0cl8bc7k4ev3';

-- Show result
SELECT "userId", "address", "pathusdBalance", "reagentBalance", "lastBalanceUpdate" 
FROM "Wallet" 
WHERE "userId" = 'did:privy:cmo2x9m4g00zz0cl8bc7k4ev3';
