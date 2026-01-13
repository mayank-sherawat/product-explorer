export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Image Placeholder */}
      <div className="aspect-2/3 bg-gray-200" />
      
      {/* Content Placeholder */}
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
        
        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
           <div className="h-8 w-16 bg-gray-200 rounded" />
           <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}