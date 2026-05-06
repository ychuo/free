-- CreateTable
CREATE TABLE "MarketIndicator" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'A_STOCK',
    "indicatorType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketIndicator_fetchedAt_idx" ON "MarketIndicator"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketIndicator_market_indicatorType_category_key" ON "MarketIndicator"("market", "indicatorType", "category");
