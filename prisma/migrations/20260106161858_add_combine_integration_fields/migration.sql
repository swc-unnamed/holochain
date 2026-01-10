-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "site_configuration_keys" ADD VALUE 'INTEGRATION_COMBINE_ACCESS_TOKEN';
ALTER TYPE "site_configuration_keys" ADD VALUE 'INTEGRATION_COMBINE_REFRESH_TOKEN';
ALTER TYPE "site_configuration_keys" ADD VALUE 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT';
ALTER TYPE "site_configuration_keys" ADD VALUE 'INTEGRATION_COMBINE_SCOPES';
