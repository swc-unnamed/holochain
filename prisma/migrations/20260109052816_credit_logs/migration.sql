/*
  Warnings:

  - You are about to drop the `automation_credit_log_checkpoints` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "automation_credit_log_checkpoints";

-- CreateTable
CREATE TABLE "platform_credit_logs" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "transaction_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "communication" TEXT NOT NULL,
    "reciever" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "platform_credit_logs_pkey" PRIMARY KEY ("id")
);
