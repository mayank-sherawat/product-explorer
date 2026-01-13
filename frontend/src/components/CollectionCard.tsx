import Link from "next/link";
import { Collection } from "@/lib/types";

export default function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="border rounded p-4 hover:bg-gray-50"
    >
      {collection.title}
    </Link>
  );
}
