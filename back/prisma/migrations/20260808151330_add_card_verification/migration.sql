-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cardRejectionReason" TEXT,
ADD COLUMN     "cardStatus" "CardStatus" NOT NULL DEFAULT 'PENDING';
