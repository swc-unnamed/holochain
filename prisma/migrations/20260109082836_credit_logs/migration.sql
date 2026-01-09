/*
  Warnings:

  - You are about to drop the column `reciever` on the `platform_credit_logs` table. All the data in the column will be lost.
  - Added the required column `receiver` to the `platform_credit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platform_credit_logs" DROP COLUMN "reciever",
ADD COLUMN     "receiver" TEXT NOT NULL;
