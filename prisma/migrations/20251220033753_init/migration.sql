-- CreateEnum
CREATE TYPE "lot_status" AS ENUM ('SUBMITTED', 'SCHEDULED', 'SOLD', 'COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "auction_status" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED', 'PENDING');

-- CreateEnum
CREATE TYPE "auction_configuration_key" AS ENUM ('LIVE_DISCORD_BROADCAST_WEBHOOK_URL');

-- CreateEnum
CREATE TYPE "app_roles" AS ENUM ('PATRON', 'AUCTIONEER', 'DEVELOPER', 'TZAR');

-- CreateEnum
CREATE TYPE "organization_roles" AS ENUM ('PATRON', 'MEMBER', 'MODERATOR', 'ADMINISTRATOR', 'OWNER');

-- CreateEnum
CREATE TYPE "user_preference_keys" AS ENUM ('GLOBAL_THEME_MODE', 'GLOBAL_ENABLE_NOTIFICATIONS', 'GLOBAL_ANONYMOUS_MODE');

-- CreateEnum
CREATE TYPE "site_configuration_keys" AS ENUM ('COMBINE_CLIENT_ID', 'COMBINE_CLIENT_SECRET', 'GLOBAL_REQUIRE_COMBINE_AUTHENTICATION', 'GLOBAL_DISABLE_NAME_VERIFICATION');

-- CreateEnum
CREATE TYPE "entity_transaction_types" AS ENUM ('MARKETPLACE_PURCHASE', 'AUCTION_BID', 'DONATION');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "combine_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_images" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "auction_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_date" TIMESTAMP(3),

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "lot_number" SERIAL NOT NULL,
    "auction_id" TEXT,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "lot_status" NOT NULL DEFAULT 'SUBMITTED',
    "created_by_id" TEXT,
    "purchased_by_id" TEXT,
    "start_price" TEXT NOT NULL,
    "purchase_price" TEXT,
    "anon_lot" BOOLEAN NOT NULL DEFAULT false,
    "credits_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_histories" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_items" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "batch" BOOLEAN NOT NULL DEFAULT false,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "uuu" BOOLEAN NOT NULL DEFAULT true,
    "entity_id" TEXT NOT NULL,
    "asset_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_configurations" (
    "id" TEXT NOT NULL,
    "key" "auction_configuration_key" NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "combine_uid" TEXT NOT NULL,
    "combine_href" TEXT NOT NULL,
    "combine_data" JSONB NOT NULL,
    "image_small" TEXT NOT NULL,
    "image_large" TEXT NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_transactions" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "entity_transaction_types" NOT NULL,
    "from_anoid" TEXT,
    "to_anoid" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_configurations" (
    "id" TEXT NOT NULL,
    "key" "site_configuration_keys" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "site_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "anonid" TEXT NOT NULL,
    "karma" INTEGER NOT NULL DEFAULT 0,
    "combine_id" TEXT,
    "combine_scopes" TEXT[] DEFAULT ARRAY['character_read']::TEXT[],
    "password_hash" TEXT,
    "role" "app_roles" NOT NULL DEFAULT 'PATRON',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_reason" TEXT,
    "banned_until" TIMESTAMP(3),
    "banned_by_id" TEXT,
    "avatar_url" TEXT,
    "discord_id" TEXT,
    "discord_username" TEXT,
    "approved_middle" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" "user_preference_keys" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_karma_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_karma_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_combine_id_key" ON "assets"("combine_id");

-- CreateIndex
CREATE UNIQUE INDEX "lots_lot_number_key" ON "lots"("lot_number");

-- CreateIndex
CREATE UNIQUE INDEX "auction_configurations_key_key" ON "auction_configurations"("key");

-- CreateIndex
CREATE UNIQUE INDEX "entities_combine_uid_key" ON "entities"("combine_uid");

-- CreateIndex
CREATE UNIQUE INDEX "site_configurations_key_key" ON "site_configurations"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_anonid_key" ON "users"("anonid");

-- CreateIndex
CREATE UNIQUE INDEX "users_combine_id_key" ON "users"("combine_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key_key" ON "user_preferences"("user_id", "key");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_images" ADD CONSTRAINT "asset_images_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_purchased_by_id_fkey" FOREIGN KEY ("purchased_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_histories" ADD CONSTRAINT "lot_histories_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_items" ADD CONSTRAINT "lot_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_items" ADD CONSTRAINT "lot_items_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_items" ADD CONSTRAINT "lot_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_transactions" ADD CONSTRAINT "entity_transactions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_karma_logs" ADD CONSTRAINT "user_karma_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
