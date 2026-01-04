/*
  Warnings:

  - You are about to drop the column `body` on the `api_client_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_client_logs" DROP COLUMN "body",
ADD COLUMN     "payload" TEXT;
