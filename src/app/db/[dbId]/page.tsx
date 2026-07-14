import { notFound } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getDatabaseById, getJalurByDb, countAlamatInJalur } from "@/lib/store";
import JalurList from "./JalurList";

interface PageProps {
  params: Promise<{ dbId: string }>;
}

export default async function DatabasePage({ params }: PageProps) {
  const { dbId } = await params;
  const db = await getDatabaseById(dbId);
  if (!db) notFound();

  const rawJalurList = await getJalurByDb(dbId);
  const jalurList = await Promise.all(
    rawJalurList.map(async (j) => ({
      ...j,
      alamatCount: await countAlamatInJalur(j.id),
    }))
  );

  return (
    <>
      <Breadcrumb items={[{ label: db.name }]} />
      <JalurList dbId={dbId} jalurList={jalurList} />
    </>
  );
}
