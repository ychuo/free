-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "costBasis" DOUBLE PRECISION,
ADD COLUMN     "exchangeCode" TEXT,
ADD COLUMN     "priceSource" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "priceUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "tickerSymbol" TEXT;

-- CreateTable
CREATE TABLE "MarketPrice" (
    "tickerSymbol" TEXT NOT NULL,
    "exchangeCode" TEXT NOT NULL,
    "name" TEXT,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "previousClose" DOUBLE PRECISION,
    "dayChange" DOUBLE PRECISION,
    "dayChangePercent" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("tickerSymbol","exchangeCode")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL DEFAULT 'CNY',
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("fromCurrency","toCurrency")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RebalanceAlert" (
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RebalanceAlert_pkey" PRIMARY KEY ("userId","category")
);

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_assetId_idx" ON "Transaction"("assetId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
