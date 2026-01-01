/*
 Warnings:
 
 - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
 - Made the column `combine_id` on table `users` required. This step will fail if there are existing NULL values in that column.
 
 */
-- AlterTable
ALTER TABLE
  "users" DROP COLUMN "password_hash";

UPDATE
  "users"
SET
  "combine_id" = ''
WHERE
  "combine_id" IS NULL;

ALTER TABLE
  "users"
ALTER COLUMN
  "combine_id"
SET
  NOT NULL;

ALTER TABLE
  "users"
ALTER COLUMN
  "combine_id"
SET
  DEFAULT '';