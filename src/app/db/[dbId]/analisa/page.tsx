import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import AnalyticsView from "@/components/AnalyticsView";
import {
  getDatabaseById,
  getAnalyticsData,
  getDatabaseSummary,
} from "@/lib/store";

interface PageProps {
  params: Promise<{ dbId: string }>;
}

export default async function AnalisaPage({ params }: PageProps) {
  const { dbId } = await params;

  const db = await getDatabaseById(dbId);
  if (!db) notFound();

  const harianData = await getAnalyticsData(dbId, "harian");
  const bulananData = await getAnalyticsData(dbId, "bulanan");
  const tahunanData = await getAnalyticsData(dbId, "tahunan");
  const summary = await getDatabaseSummary(dbId);

  return (
    <>
      <Breadcrumb
        items={[
          { label: db.name, href: `/db/${dbId}` },
          { label: "Analisa Data" },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          Analisa Penjualan & Piutang
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Analisa performa penjualan harian, bulanan, dan tahunan untuk {db.name}
        </p>
      </div>

      {/* Analytics Main View */}
      <AnalyticsView
        harianData={harianData}
        bulananData={bulananData}
        tahunanData={tahunanData}
        summary={summary}
      />
    </>
  );
}
