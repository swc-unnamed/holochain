/*
  Warnings:

  - You are about to drop the `platform_credit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "platform_credit_logs";

-- CreateTable
CREATE TABLE "combine_credit_logs" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "transaction_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "communication" TEXT NOT NULL,
    "receiver" TEXT,
    "sender" TEXT,
    "timestamp" BIGINT NOT NULL,
    "processed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_notes" TEXT,

    CONSTRAINT "combine_credit_logs_pkey" PRIMARY KEY ("id")
);
