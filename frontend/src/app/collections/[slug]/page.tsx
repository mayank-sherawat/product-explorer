"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CollectionPage() {
  const params = useParams();

  // FIX 1: Normalize slug to ensure it's a stable string
  // If params.slug is an array (e.g. catch-all route), join it. 
  // If it's a string, use it. If undefined, empty string.
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const collectionName = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Collection";

  useEffect(() => {
    // Prevent fetching if slug is empty
    if (!slug) return;

    // FIX 2: Create an AbortController to handle cleanup
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:3001/products/scrape/${slug}`,
          { signal } // Pass the signal to the fetch
        );

        if (!res.ok) throw new Error("Failed to load products");

        const data = await res.json();

        // Only update state if the component is still mounted (signal not aborted)
        if (!signal.aborted) {
          setProducts(data);
        }
      } catch (err) { // 1. Remove ": any"
        // 2. Check if it is a standard Error object
        if (err instanceof Error) {
          // Now TypeScript knows 'err' has a .name property
          if (err.name === 'AbortError') return;
        }

        console.error(err);

        if (!signal.aborted) {
          setError("Could not load products. Please try again.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    // Cleanup function: aborts the fetch if the component unmounts 
    // or if 'slug' changes before the previous fetch finishes.
    return () => {
      controller.abort();
    };
  }, [slug]); // 'slug' is now a stable string, so this won't loop

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {collectionName}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Browse our curated selection of top reads and finds.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg inline-block">
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
            {Array(10).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Data State */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.sourceId} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-gray-400 text-lg">No products found for this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}