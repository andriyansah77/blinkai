/*
  Warnings:

  - You are about to drop the column `blockTimestamp` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `gasActual` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `tokensReceived` on the `Inscription` table. All the data in the column will be lost.
  - You are about to alter the column `blockNumber` on the `Inscription` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inscriptionFee" TEXT NOT NULL,
    "gasEstimate" TEXT NOT NULL,
    "gasFee" TEXT,
    "tokensEarned" TEXT NOT NULL DEFAULT '10000',
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "scheduleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    CONSTRAINT "Inscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inscription_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inscription_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InscriptionSchedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inscription" ("blockNumber", "createdAt", "errorMessage", "gasEstimate", "id", "inscriptionFee", "retryCount", "scheduleId", "status", "txHash", "type", "updatedAt", "userId", "walletId") SELECT "blockNumber", "createdAt", "errorMessage", "gasEstimate", "id", "inscriptionFee", "retryCount", "scheduleId", "status", "txHash", "type", "updatedAt", "userId", "walletId" FROM "Inscription";
DROP TABLE "Inscription";
ALTER TABLE "new_Inscription" RENAME TO "Inscription";
CREATE UNIQUE INDEX "Inscription_txHash_key" ON "Inscription"("txHash");
CREATE INDEX "Inscription_userId_status_idx" ON "Inscription"("userId", "status");
CREATE INDEX "Inscription_walletId_createdAt_idx" ON "Inscription"("walletId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
