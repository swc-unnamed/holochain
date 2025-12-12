/*
  Warnings:

  - You are about to drop the `live_auction_configurations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "auction_configuration_key" AS ENUM ('LIVE_DISCORD_BROADCAST_WEBHOOK_URL');

-- DropTable
DROP TABLE "live_auction_configurations";

-- DropEnum
DROP TYPE "live_auction_configuration_key";

-- CreateTable
CREATE TABLE "auction_configurations" (
    "id" TEXT NOT NULL,
    "key" "auction_configuration_key" NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auction_configurations_key_key" ON "auction_configurations"("key");
