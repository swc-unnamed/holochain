/*
  Warnings:

  - Made the column `created_by_id` on table `lots` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "lots" DROP CONSTRAINT "lots_created_by_id_fkey";

-- AlterTable
ALTER TABLE "lots" ALTER COLUMN "created_by_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
