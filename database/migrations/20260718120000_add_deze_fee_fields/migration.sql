-- Add DEZE's 5% customer fee + 5% detailer fee to DetailJob, and store the
-- derived totals so payment/payout amounts don't need to be recomputed ad
-- hoc on every read.

-- AlterTable
ALTER TABLE "DetailJob" ADD COLUMN "customerFee" DOUBLE PRECISION;
ALTER TABLE "DetailJob" ADD COLUMN "detailerFee" DOUBLE PRECISION;
ALTER TABLE "DetailJob" ADD COLUMN "totalCustomerCost" DOUBLE PRECISION;
ALTER TABLE "DetailJob" ADD COLUMN "detailerPayout" DOUBLE PRECISION;

-- Backfill fees for jobs that already have an agreed price
UPDATE "DetailJob"
SET
  "customerFee" = ROUND(("agreedPrice" * 0.05)::numeric, 2)::float8,
  "detailerFee" = ROUND(("agreedPrice" * 0.05)::numeric, 2)::float8,
  "totalCustomerCost" = ROUND(("agreedPrice" * 1.05)::numeric, 2)::float8,
  "detailerPayout" = ROUND(("agreedPrice" * 0.95)::numeric, 2)::float8
WHERE "agreedPrice" IS NOT NULL;
