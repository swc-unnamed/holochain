/*
  Warnings:

  - Made the column `icon` on table `chain_trust_rating_config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chain_trust_rating_config" ALTER COLUMN "icon" SET NOT NULL,
ALTER COLUMN "icon" SET DEFAULT 'mdi:progress-star-four-points';
