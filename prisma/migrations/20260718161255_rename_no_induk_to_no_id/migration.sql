/*
  Warnings:

  - You are about to drop the column `harga` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `noInduk` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `orderStatus` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `totalBayar` on the `Outlet` table. All the data in the column will be lost.
  - You are about to drop the column `totalPiutang` on the `Outlet` table. All the data in the column will be lost.
  - Added the required column `noId` to the `Outlet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Outlet" DROP COLUMN "harga",
DROP COLUMN "noInduk",
DROP COLUMN "order",
DROP COLUMN "orderStatus",
DROP COLUMN "status",
DROP COLUMN "totalBayar",
DROP COLUMN "totalPiutang",
ADD COLUMN     "noId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "totalBayar" DOUBLE PRECISION NOT NULL,
    "totalPiutang" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "orderStatus" TEXT NOT NULL DEFAULT 'Sukses',
    "tglOrder" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
    "outletId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
    "tglPayment" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outletId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
