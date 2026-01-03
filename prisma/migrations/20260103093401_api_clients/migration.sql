/*
  Warnings:

  - You are about to drop the column `error_msg` on the `api_client_logs` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `api_client_logs` table. All the data in the column will be lost.
  - Added the required column `status` to the `api_client_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_text` to the `api_client_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_client_logs" DROP COLUMN "error_msg",
DROP COLUMN "success",
ADD COLUMN     "status" INTEGER NOT NULL,
ADD COLUMN     "status_text" TEXT NOT NULL;
