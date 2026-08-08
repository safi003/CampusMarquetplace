-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cardRejectionReason" TEXT,
ADD COLUMN     "cardStatus" "CardStatus" NOT NULL DEFAULT 'PENDING';

-- Les utilisateurs existants qui ont déjà fourni une carte restent valides
UPDATE "User" SET "cardStatus" = 'APPROVED' WHERE "imageCarteScolaire" IS NOT NULL;
