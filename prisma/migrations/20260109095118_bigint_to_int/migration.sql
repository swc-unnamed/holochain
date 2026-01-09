/*
  Warnings:

  - You are about to alter the column `transaction_id` on the `combine_credit_logs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `amount` on the `combine_credit_logs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `timestamp` on the `combine_credit_logs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `amount` on the `lot_transactions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "combine_credit_logs" ALTER COLUMN "transaction_id" SET DATA TYPE INTEGER,
ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "timestamp" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "lot_transactions" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
