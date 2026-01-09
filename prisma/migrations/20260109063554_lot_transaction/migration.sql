/*
  Warnings:

  - Added the required column `amount` to the `lot_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lot_transactions" ADD COLUMN     "amount" BIGINT NOT NULL;
