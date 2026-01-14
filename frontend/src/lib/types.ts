export interface Collection {
  id: number;
  title: string;
  slug: string;
  productCount?: number | null;
}

export interface Review {
  id: number;
  author: string | null;
  rating: number | null;
  text: string;
  createdAt: string;
}

export interface ProductDetail {
  description: string;
  specs: Record<string, string>;
  ratingsAvg?: number | null;
  reviewsCount?: number | null;
}

export interface Product {
  sourceId: string;
  title: string;
  author?: string | null;
  price: number;
  currency: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface ProductWithDetail extends Product {
  detail?: ProductDetail | null;
  reviews?: Review[];
  relatedProducts?: Product[];
}