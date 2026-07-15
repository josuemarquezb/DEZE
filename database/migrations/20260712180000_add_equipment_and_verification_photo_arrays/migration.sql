-- Replace the single-photo DetailerProfile.equipmentPhoto column with a
-- multi-photo array, and add a new array column for verification documents.

-- AlterTable
ALTER TABLE "DetailerProfile" ADD COLUMN "equipmentPhotos" TEXT[];
ALTER TABLE "DetailerProfile" ADD COLUMN "verificationDocs" TEXT[];

-- Preserve any existing single equipment photo by moving it into the new array column
UPDATE "DetailerProfile" SET "equipmentPhotos" = ARRAY["equipmentPhoto"] WHERE "equipmentPhoto" IS NOT NULL;

ALTER TABLE "DetailerProfile" DROP COLUMN "equipmentPhoto";
