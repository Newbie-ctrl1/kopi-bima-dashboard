-- CreateTable
CREATE TABLE "Database" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Database_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jalur" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "databaseId" TEXT NOT NULL,

    CONSTRAINT "Jalur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alamat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jalurId" TEXT NOT NULL,

    CONSTRAINT "Alamat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "noInduk" TEXT NOT NULL,
    "outlet" TEXT NOT NULL,
    "kunjungan" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "totalBayar" DOUBLE PRECISION NOT NULL,
    "totalPiutang" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "alamatId" TEXT NOT NULL,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jalur" ADD CONSTRAINT "Jalur_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "Database"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alamat" ADD CONSTRAINT "Alamat_jalurId_fkey" FOREIGN KEY ("jalurId") REFERENCES "Jalur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_alamatId_fkey" FOREIGN KEY ("alamatId") REFERENCES "Alamat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
