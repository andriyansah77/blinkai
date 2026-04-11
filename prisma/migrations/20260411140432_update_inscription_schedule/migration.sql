/*
  Warnings:

  - You are about to drop the column `completedCount` on the `InscriptionSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `inscriptionCount` on the `InscriptionSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `lastRunAt` on the `InscriptionSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `nextRunAt` on the `InscriptionSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `InscriptionSchedule` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InscriptionSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxExecutions" INTEGER,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecution" DATETIME,
    "nextExecution" DATETIME,
    "lastExecutionStatus" TEXT,
    "pauseReason" TEXT,
    "notifyOnPause" BOOLEAN NOT NULL DEFAULT true,
    "hermesCronId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InscriptionSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InscriptionSchedule" ("createdAt", "cronExpression", "frequency", "hermesCronId", "id", "updatedAt", "userId") SELECT "createdAt", "cronExpression", "frequency", "hermesCronId", "id", "updatedAt", "userId" FROM "InscriptionSchedule";
DROP TABLE "InscriptionSchedule";
ALTER TABLE "new_InscriptionSchedule" RENAME TO "InscriptionSchedule";
CREATE UNIQUE INDEX "InscriptionSchedule_hermesCronId_key" ON "InscriptionSchedule"("hermesCronId");
CREATE INDEX "InscriptionSchedule_userId_enabled_idx" ON "InscriptionSchedule"("userId", "enabled");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
