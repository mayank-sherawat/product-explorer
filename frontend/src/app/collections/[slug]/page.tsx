"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/Skeleton";

interface Product {
  sourceId: string;
  title: string;
  author?: string | null;
  price: number;
  currency: string;
  imageUrl?: string;
  sourceUrl?: string;
}

interface ApiResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CollectionPage() {
  const params = useParams();
  const pathname = usePathname();
  
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug || "";
  const collectionName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Collection";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId") || Math.random().toString(36).substring(7);
    localStorage.setItem("sessionId", sessionId);

    fetch("https://product-explorer-5oji.onrender.com/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path: pathname }),
    }).catch(console.error);
  }, [pathname]);

  
  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        
        const res = await fetch(
          `https://product-explorer-5oji.onrender.com/products/collection/${slug}?page=${page}&limit=20`,
          { signal }
        );

        if (!res.ok) throw new Error("Failed to load products");

        const json: ApiResponse = await res.json();

        if (!signal.aborted) {
          setProducts(json.data);
          setTotalPages(json.meta.totalPages);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error(err);
        if (!signal.aborted) setError("Could not load products. Please try again.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [slug, page]); // Re-run when page changes

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {collectionName}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Browse our curated selection of top reads and finds.
          </p>
        </div>

        {error && (
          <div className="text-center py-10">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg inline-block">{error}</div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.sourceId} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border rounded bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border rounded bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}