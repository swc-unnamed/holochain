-- CreateEnum
CREATE TYPE "chain_trust_rating_event" AS ENUM ('AH_LOT_CREATED', 'AH_LOT_PURCHASED', 'AH_LOT_SOLD', 'AH_LOT_WITHDRAWN_AFTER_SCHEDULED', 'AH_LOT_WITHDRAWN_BEFORE_SCHEDULED', 'ACCOUNT_CREATED', 'ACCOUNT_DISCORD_LINKED', 'ACCOUNT_DISCORD_UNLINKED', 'ACCOUNT_ROLE_PROMOTED', 'ACCOUNT_ROLE_DEMOTED', 'ACCOUNT_BANNED', 'ACCOUNT_UNBANNED');

-- CreateTable
CREATE TABLE "chain_trust_rating_config" (
    "key" "chain_trust_rating_event" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chain_trust_rating_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "chain_trust_rating_config_key_key" ON "chain_trust_rating_config"("key");
