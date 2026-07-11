import { getDatabases, countJalurInDb } from "@/lib/store";
import DatabaseList from "./DatabaseList";

export default async function Home() {
  const list = await getDatabases();
  const databases = await Promise.all(
    list.map(async (db) => ({
      ...db,
      jalurCount: await countJalurInDb(db.id),
    }))
  );

  return <DatabaseList databases={databases} />;
}
