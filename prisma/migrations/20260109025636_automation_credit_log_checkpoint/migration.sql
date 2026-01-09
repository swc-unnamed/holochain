-- CreateTable
CREATE TABLE "automation_credit_log_checkpoints" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "automation_credit_log_checkpoints_pkey" PRIMARY KEY ("id")
);
