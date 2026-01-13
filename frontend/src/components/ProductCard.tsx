import Link from "next/link";
import Image from "next/image";

interface ProductProps {
  product: {
    sourceId: string;
    title: string;
    author?: string | null;
    price: number;
    currency: string;
    imageUrl?: string;
    sourceUrl?: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <Link 
      href={`/products/${product.sourceId}`}
      className="group relative block bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="aspect-2/3 relative w-full bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 bg-gray-100">
            <span className="text-4xl">📚</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 h-14"> {/* Fixed height for alignment */}
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-sm">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {product.author || "Unknown Author"}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Price</span>
            <span className="text-lg font-bold text-emerald-600">
              {product.currency === 'GBP' ? '£' : '$'}{product.price.toFixed(2)}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}