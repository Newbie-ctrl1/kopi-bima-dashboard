import Breadcrumb from "@/components/Breadcrumb";
import GlobalAnalyticsTab from "@/components/GlobalAnalyticsTab";
import { getGlobalSummary, getGlobalPeriodSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AnalisaGlobalPage() {
  const summary = await getGlobalSummary();
  const periodSummary = await getGlobalPeriodSummary();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Daftar Database", href: "/" },
          { label: "Analisa Global" },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          Analisa Finansial Global
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Akumulasi performa transaksi dari seluruh database aktif
        </p>
      </div>

      <GlobalAnalyticsTab
        summary={summary}
        periodSummary={periodSummary}
      />
    </>
  );
}
