/*
  Warnings:

  - You are about to drop the column `approved` on the `api_clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_clients" DROP COLUMN "approved",
ADD COLUMN     "last_used_at" TIMESTAMP(3);
