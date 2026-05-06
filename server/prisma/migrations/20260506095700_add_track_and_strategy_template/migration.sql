-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "track" TEXT NOT NULL DEFAULT 'unclassified';

-- CreateTable
CREATE TABLE "StrategyTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suitableFor" TEXT NOT NULL,
    "indicators" JSONB NOT NULL,
    "allocation" JSONB NOT NULL,
    "examples" JSONB,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyTemplate_pkey" PRIMARY KEY ("id")
);
