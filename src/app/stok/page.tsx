import Breadcrumb from "@/components/Breadcrumb";
import SingleStockView from "@/components/SingleStockView";
import { getCoffeeStocks, createCoffeeStock } from "@/lib/store";
import { updateCoffeeStockAction } from "@/app/actions";

export default async function StokPage() {
  let stocks = await getCoffeeStocks();
  if (stocks.length === 0) {
    // Auto-create default Kopi Cap Bima stock if missing
    await createCoffeeStock("Kopi Cap Bima", "KCB-01", 50.0, "kardus", 85000);
    stocks = await getCoffeeStocks();
  }
  const mainStock = stocks[0];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Daftar Database", href: "/" },
          { label: "Stok Kopi" },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          Manajemen Stok Kopi
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Kendali volume persediaan gudang dan penyesuaian harga Kopi Cap Bima
        </p>
      </div>

      <SingleStockView
        stock={mainStock}
        onUpdateStock={updateCoffeeStockAction}
      />
    </>
  );
}
