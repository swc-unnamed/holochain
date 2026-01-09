-- CreateTable
CREATE TABLE "lot_transactions" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "tx_hash" VARCHAR(66) NOT NULL,
    "lot_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "lot_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lot_transactions_tx_hash_key" ON "lot_transactions"("tx_hash");

-- AddForeignKey
ALTER TABLE "lot_transactions" ADD CONSTRAINT "lot_transactions_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_transactions" ADD CONSTRAINT "lot_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
