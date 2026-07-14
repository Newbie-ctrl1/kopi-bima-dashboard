import { notFound } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import {
  getDatabaseById,
  getJalurById,
  getAlamatByJalur,
  countOutletsInAlamat,
} from "@/lib/store";
import AlamatList from "./AlamatList";

interface PageProps {
  params: Promise<{ dbId: string; jalurId: string }>;
}

export default async function JalurPage({ params }: PageProps) {
  const { dbId, jalurId } = await params;

  const db = await getDatabaseById(dbId);
  const jalur = await getJalurById(jalurId);
  if (!db || !jalur) notFound();

  const rawAlamatList = await getAlamatByJalur(jalurId);
  const alamatList = await Promise.all(
    rawAlamatList.map(async (a) => ({
      ...a,
      outletCount: await countOutletsInAlamat(a.id),
    }))
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: db.name, href: `/db/${dbId}` },
          { label: jalur.name },
        ]}
      />
      <AlamatList dbId={dbId} jalurId={jalurId} alamatList={alamatList} />
    </>
  );
}
