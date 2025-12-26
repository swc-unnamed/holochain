/*
  Warnings:

  - You are about to drop the column `karma` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `user_karma_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_karma_logs" DROP CONSTRAINT "user_karma_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "karma",
ADD COLUMN     "ctr" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "user_karma_logs";

-- CreateTable
CREATE TABLE "chain_trust_rating_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chain_trust_rating_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chain_trust_rating_logs" ADD CONSTRAINT "chain_trust_rating_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
