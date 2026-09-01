/*
  Warnings:

  - The `mode` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isSold` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('DIRECT', 'HAND_DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SECURED', 'DIRECT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NONE', 'HELD', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentLockedByStaff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "sellerConfirmed" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "mode",
ADD COLUMN     "mode" "DeliveryMode" NOT NULL DEFAULT 'DIRECT';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image",
DROP COLUMN "isSold",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE';
