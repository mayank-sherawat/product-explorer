export interface Collection {
  id: number;
  title: string;
  slug: string;
}

export interface Product {
  id: number;
  title: string;
  author: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  sourceId: string;
}

export interface ProductDetail {
  description: string;
  specs: Record<string, string>;
}

export interface ProductWithDetail {
  id: number;
  title: string;
  author: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  sourceId: string;
  detail?: {
    description: string;
    specs: Record<string, string>;
  };
}
