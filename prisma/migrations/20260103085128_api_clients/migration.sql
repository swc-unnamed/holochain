-- CreateEnum
CREATE TYPE "api_client_scopes" AS ENUM ('HOLOCHAIN_DATABASE_READ', 'HOLOCHAIN_TRANSACTIONS_READ', 'HOLOCHAIN_TRANSACTIONS_WRITE', 'MARKET_READ_CONTRACTS', 'MARKET_LIST_CONTRACTS', 'MARKET_CREATE_CONTRACTS');

-- CreateEnum
CREATE TYPE "api_client_statuses" AS ENUM ('PENDING', 'APPROVED', 'REVOKED');

-- CreateTable
CREATE TABLE "api_clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "scopes" "api_client_scopes"[] DEFAULT ARRAY[]::"api_client_scopes"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "api_client_statuses" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "api_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_client_logs" (
    "id" TEXT NOT NULL,
    "api_client_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency_ms" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error_msg" TEXT,
    "body" TEXT,

    CONSTRAINT "api_client_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_clients_name_key" ON "api_clients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "api_clients_api_key_key" ON "api_clients"("api_key");

-- AddForeignKey
ALTER TABLE "api_clients" ADD CONSTRAINT "api_clients_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_client_logs" ADD CONSTRAINT "api_client_logs_api_client_id_fkey" FOREIGN KEY ("api_client_id") REFERENCES "api_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
