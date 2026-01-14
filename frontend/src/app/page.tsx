"use client";

import { useEffect, useState } from "react";
// Removed unused "Link" import
import CollectionCard from "@/components/CollectionCard";

interface Collection {
  id: number;
  title: string;
  slug: string;
  productCount?: number;
}

export default function Home() {
  // ✅ FIX 1: Always initialize with empty array
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch Collections (Read Only)
  const loadCollections = async () => {
    try {
      const res = await fetch("https://product-explorer-5oji.onrender.com/collections"); // Make sure path is /collections if that's your route
      const data = await res.json();
      
      console.log("API Data:", data); // Debug log

      // ✅ FIX 2: Check data structure before setting state
      if (Array.isArray(data)) {
        setCollections(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Handle cases where API returns { data: [...] }
        setCollections(data.data);
      } else {
        console.error("Unexpected API response format:", data);
        setCollections([]); // Fallback to empty array
      }
    } catch (e) {
      console.error(e);
      setCollections([]); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Trigger Scrape
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await fetch("https://product-explorer-5oji.onrender.com/collections/scrape", { method: "POST" });
      await loadCollections(); // Refresh list after update
      alert("Database updated successfully!");
    } catch { 
      // Removed unused 'e' variable here
      alert("Update failed. Check backend console.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Collections</h1>
        
        <button
          onClick={handleUpdate}
          disabled={updating}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
            updating 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {updating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating Database...
            </span>
          ) : (
            "↻ Update Database"
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ✅ FIX 3: Safety Check in JSX - Prevents crash if state is somehow invalid */}
          {Array.isArray(collections) && collections.length > 0 ? (
            collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))
          ) : (
             null // Or render nothing if empty to let the "No collections found" block handle it
          )}
        </div>
      )}
      
      {!loading && (!collections || collections.length === 0) && (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500 mb-4">No collections found.</p>
          <p className="text-sm text-gray-400">Click Update Database to fetch data from World of Books.</p>
        </div>
      )}
    </main>
  );
}