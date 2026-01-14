import { fetcher } from "@/lib/api";
import { ProductWithDetail } from "@/lib/types";
import Image from "next/image";
import Link from "next/link"; // Import Link for related products

type Props = {
    params: Promise<{ sourceId: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
    const { sourceId } = await params;

    const product = await fetcher<ProductWithDetail>(
        `/products/${sourceId}`
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-12">
            {/* Top Section: Image & Info */}
            <div className="flex flex-col md:flex-row gap-8">
                {product.imageUrl && (
                    <div className="flex-shrink-0">
                         <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={300}
                            height={450}
                            className="w-full md:w-72 h-auto rounded-lg shadow-md border"
                            priority
                        />
                    </div>
                )}

                <div className="flex-grow">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.title}</h1>

                    {product.author && (
                        <p className="text-lg text-gray-600 mb-4">by <span className="font-semibold">{product.author}</span></p>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                         <span className="text-3xl font-bold text-green-700">£{product.price}</span>
                         {product.detail?.ratingsAvg ? (
                             <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                 ★ {product.detail.ratingsAvg} / 5
                             </span>
                         ) : null}
                    </div>

                    {product.detail?.description && (
                        <div className="prose max-w-none text-gray-700 mb-6">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p>{product.detail.description}</p>
                        </div>
                    )}

                    {product.detail?.specs && Object.keys(product.detail.specs).length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold mb-3">Product Details</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {Object.entries(product.detail.specs).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b pb-1 last:border-0">
                                        <dt className="text-gray-500">{key}</dt>
                                        <dd className="font-medium text-gray-900 text-right">{String(value)}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            {product.relatedProducts && product.relatedProducts.length > 0 && (
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-6">You might also like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {product.relatedProducts.map((rel) => (
                             <Link key={rel.sourceId} href={`/products/${rel.sourceId}`} className="group block">
                                <div className="aspect-[2/3] relative mb-3 overflow-hidden rounded-md bg-gray-100">
                                    {rel.imageUrl ? (
                                        <Image src={rel.imageUrl} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600">{rel.title}</h3>
                                <p className="text-gray-500 text-sm">£{rel.price}</p>
                             </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews ({product.reviews.length})</h2>
                    <div className="space-y-4">
                        {product.reviews.map((review, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">{review.author || "Anonymous"}</span>
                                    {review.rating && <span className="text-yellow-500">{"★".repeat(review.rating)}</span>}
                                </div>
                                <p className="text-gray-700">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}