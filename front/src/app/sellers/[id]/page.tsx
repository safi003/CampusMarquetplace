import { Product } from "@/types/product";
import SellerTabs from "@/components/seller-tabs";

interface Seller {
  id: number;
  name: string;
  createdAt: string;
  _count: { products: number };
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: number; name: string };
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

async function getSellerProducts(id: string): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?sellerId=${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erreur lors du chargement");
  return res.json();
}

async function getSellerInfo(id: string): Promise<Seller | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getReviews(id: string): Promise<ReviewsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return { reviews: [], averageRating: 0, totalReviews: 0 };
  return res.json();
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, seller, reviewsData] = await Promise.all([
    getSellerProducts(id),
    getSellerInfo(id),
    getReviews(id),
  ]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <SellerTabs seller={seller} products={products} reviewsData={reviewsData} sellerId={Number(id)} />
    </div>
  );
}
