import { fetcher } from "@/lib/api";
import { Collection } from "@/lib/types";
import CollectionCard from "@/components/CollectionCard";

export default async function Home() {
  const collections = await fetcher<Collection[]>("/collections");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Browse Collections</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
    </main>
  );
}
