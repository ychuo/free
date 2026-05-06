-- CreateTable
CREATE TABLE "SignalRecord" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'A_STOCK',
    "track" TEXT NOT NULL,
    "targetCode" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'mid',
    "backtest" JSONB,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalJournal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "signalId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL DEFAULT 'watched',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignalRecord_market_track_idx" ON "SignalRecord"("market", "track");

-- CreateIndex
CREATE INDEX "SignalRecord_triggeredAt_idx" ON "SignalRecord"("triggeredAt");

-- CreateIndex
CREATE INDEX "SignalJournal_userId_idx" ON "SignalJournal"("userId");

-- CreateIndex
CREATE INDEX "SignalJournal_signalId_idx" ON "SignalJournal"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalJournal_userId_signalId_key" ON "SignalJournal"("userId", "signalId");

-- AddForeignKey
ALTER TABLE "SignalJournal" ADD CONSTRAINT "SignalJournal_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "SignalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
