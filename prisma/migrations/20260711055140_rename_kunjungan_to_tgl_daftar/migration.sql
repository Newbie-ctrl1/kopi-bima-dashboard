/*
  Warnings:

  - You are about to drop the column `kunjungan` on the `Outlet` table. All the data in the column will be lost.
  - Added the required column `tglDaftar` to the `Outlet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Outlet" DROP COLUMN "kunjungan",
ADD COLUMN     "tglDaftar" TEXT NOT NULL;
