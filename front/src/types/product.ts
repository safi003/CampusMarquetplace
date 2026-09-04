export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  address: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD"; 
  handDelivery: boolean;
  createdAt: string;
  images: { id: number; url: string }[]; // remplace image: string | null
  seller: { id: number; name: string };
  category: { id: number; name: string; slug: string };
}