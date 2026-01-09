-- AlterTable
ALTER TABLE "platform_credit_logs" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
