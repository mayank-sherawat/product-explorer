import { fetcher } from "@/lib/api";
import { ProductWithDetail } from "@/lib/types";
import Image from "next/image";

type Props = {
    params: Promise<{ sourceId: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
    const { sourceId } = await params;

    const product = await fetcher<ProductWithDetail>(
        `/products/${sourceId}`
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {product.author && (
                <p className="text-gray-600 mb-4">by {product.author}</p>
            )}

            <div className="flex gap-6">
                {product.imageUrl && (
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={192}   // w-48 = 192px
                        height={256}  // adjust as needed
                        className="h-auto rounded border"
                        priority
                    />
                )}

                <div>
                    <p className="text-xl font-semibold mb-2">
                        £{product.price}
                    </p>

                    {product.detail?.description && (
                        <p className="mb-4">{product.detail.description}</p>
                    )}

                    {product.detail?.specs && (
                        <div className="mt-4">
                            <h2 className="font-semibold mb-2">Details</h2>
                            <ul className="text-sm space-y-1">
                                {Object.entries(product.detail.specs).map(
                                    ([key, value]) => (
                                        <li key={key}>
                                            <strong>{key}:</strong>{" "}
                                            {String(value)}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
