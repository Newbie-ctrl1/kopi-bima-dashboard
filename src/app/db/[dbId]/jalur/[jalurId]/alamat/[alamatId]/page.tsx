import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import StatsCards from "@/components/StatsCards";
import DataTable from "@/components/DataTable";
import {
  getDatabaseById,
  getJalurById,
  getAlamatById,
  getOutletsWithSummary,
  getOutletStats,
  getNextNoInduk,
} from "@/lib/store";
import {
  createOutletAction,
  updateOutletAction,
  deleteOutletAction,
  uploadOutletsAction,
} from "@/app/actions";

interface PageProps {
  params: Promise<{ dbId: string; jalurId: string; alamatId: string }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AlamatPage({ params }: PageProps) {
  const { dbId, jalurId, alamatId } = await params;

  const db = await getDatabaseById(dbId);
  const jalur = await getJalurById(jalurId);
  const alamat = await getAlamatById(alamatId);
  if (!db || !jalur || !alamat) notFound();

  const outlets = await getOutletsWithSummary(alamatId);
  const stats = await getOutletStats(alamatId);
  const nextNoInduk = await getNextNoInduk(alamatId);
  const basePath = `/db/${dbId}/jalur/${jalurId}/alamat/${alamatId}`;

  const statsData = [
    {
      label: "Total Outlet",
      value: stats.total,
      gradient: "gradient-amber",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
        </svg>
      ),
    },
    {
      label: "Total Pendapatan",
      value: formatCurrency(stats.totalPendapatan),
      gradient: "gradient-purple",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Total Pemasukan",
      value: formatCurrency(stats.totalPemasukan),
      gradient: "gradient-emerald",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Total Piutang",
      value: formatCurrency(stats.totalPiutang),
      gradient: "gradient-rose",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: db.name, href: `/db/${dbId}` },
          { label: jalur.name, href: `/db/${dbId}/jalur/${jalurId}` },
          { label: alamat.name },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          {alamat.name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Data outlet di {alamat.name}, {jalur.name}
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={statsData} />

      {/* Data Table */}
      <DataTable
        outlets={outlets}
        alamatId={alamatId}
        basePath={basePath}
        nextNoInduk={nextNoInduk}
        onCreateOutlet={createOutletAction}
        onUpdateOutlet={updateOutletAction}
        onDeleteOutlet={deleteOutletAction}
        onUploadOutlets={uploadOutletsAction}
      />
    </>
  );
}
