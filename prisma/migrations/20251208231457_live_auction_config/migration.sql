-- CreateEnum
CREATE TYPE "live_auction_configuration_key" AS ENUM ('DISCORD_BROADCAST_WEBHOOK_URL');

-- CreateTable
CREATE TABLE "live_auction_configurations" (
    "id" TEXT NOT NULL,
    "key" "live_auction_configuration_key" NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_auction_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_auction_configurations_key_key" ON "live_auction_configurations"("key");
