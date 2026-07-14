import Breadcrumb from "@/components/layout/Breadcrumb";
import GlobalOrdersView from "@/components/order/GlobalOrdersView";
import { getOrdersByDatabase, getOutletsByDatabase, getDatabaseById, getPaymentsByDatabase } from "@/lib/store";
import { createOrderAction, updateOrderAction, deleteOrderAction, createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/app/actions";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ dbId: string }>;
}

export default async function ProgresOrderPage({ params }: Props) {
  const { dbId } = await params;
  const db = await getDatabaseById(dbId);
  if (!db) notFound();

  const orders = await getOrdersByDatabase(dbId);
  const payments = await getPaymentsByDatabase(dbId);
  const outlets = await getOutletsByDatabase(dbId);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Daftar Database", href: "/" },
          { label: db.name, href: `/db/${dbId}` },
          { label: "Progres Order" },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
          Progres Order — {db.name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Buat, pantau, dan kelola pesanan serta pembayaran piutang kopi di database <strong>{db.name}</strong>
        </p>
      </div>

      <GlobalOrdersView
        initialOrders={orders}
        initialPayments={payments}
        outlets={outlets}
        basePath={`/db/${dbId}/progres-order`}
        onCreateOrder={createOrderAction}
        onUpdateOrder={updateOrderAction}
        onDeleteOrder={deleteOrderAction}
        onCreatePayment={createPaymentAction}
        onUpdatePayment={updatePaymentAction}
        onDeletePayment={deletePaymentAction}
      />
    </>
  );
}
