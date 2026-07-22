export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isSold: boolean;
  createdAt: string;
  images: { id: number; url: string }[]; // remplace image: string | null
  seller: { id: number; name: string };
  category: { id: number; name: string; slug: string };
}