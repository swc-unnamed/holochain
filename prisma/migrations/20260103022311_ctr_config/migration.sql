/*
 Warnings:
 - Delete all data within the chain_trust_rating_logs table before applying this SQL migration. Then run the migration found at scripts/update_ctr_logs.ts to repopulate the table.
 - Added the required column `event` to the `chain_trust_rating_logs` table without a default value. This is not possible if the table is not empty.
 */
-- RemoveData
DELETE FROM
  "chain_trust_rating_logs";

-- Update Users table to set the CTR to 0
UPDATE
  "users"
SET
  "ctr" = 0;

-- AlterTable
ALTER TABLE
  "chain_trust_rating_logs"
ADD
  COLUMN "event" "chain_trust_rating_event" NOT NULL;