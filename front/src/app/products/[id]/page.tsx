import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import BuyButton from "@/components/buy-button";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import WishlistButton from "@/components/wishlistButton";
import { DeleteProductButton } from "@/components/delete-product-button";
import { EditProductButton } from "@/components/edit-product-button";
import RatingSummary from "@/components/rating-summary";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Erreur lors du chargement du produit");
  }

  return res.json();
}

async function getReviews(id: string): Promise<ReviewsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return { reviews: [], averageRating: 0, totalReviews: 0 };
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const reviewsData = await getReviews(String(product.seller.id));

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Galerie d'images - Carousel */}
        <div className="md:w-2/3">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img) => (
                <CarouselItem key={img.id}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${img.url}`}
                    alt={product.name}
                    className="w-full h-80 object-contain bg-gray-100 rounded"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3" />
            <CarouselNext className="right-3" />
          </Carousel>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-gray-500">{product.category.name}</p>
              <p className="text-xl font-semibold mt-2">{product.price} FCFA</p>
            </div>

            <p>{product.description}</p>
            <p className="text-gray-500">📍 {product.address}</p>
            <p className="text-sm text-gray-400">
              Vendu par{" "}
              <Link
                href={`/sellers/${product.seller.id}`}
                className="hover:text-[#4AA3A2] hover:underline"
              >
                {product.seller.name}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <WishlistButton productId={product.id} />
            <DeleteProductButton
              productId={product.id}
              sellerId={product.seller.id}
            />
            <EditProductButton
              productId={product.id}
              sellerId={product.seller.id}
            />
          </div>
        </div>

        {/* Séparateur mobile */}
        <hr className="border-border md:hidden my-4 min" />

        {/* Profil du vendeur + actions */}
        <div className="md:w-1/3 self-start flex flex-col gap-5 rounded-xl border border-border bg-card p-5 max-h-80 overflow-y-auto">
          {/* Profil du vendeur */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/sellers/${product.seller.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4AA3A2]/15 text-[#4AA3A2] font-semibold">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{product.seller.name}</p>
<div className="px-1">
              <RatingSummary
                averageRating={reviewsData.averageRating}
                totalReviews={reviewsData.totalReviews}
              />
            </div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-col gap-2.5">
            {product.isSold ? (
              <div className="rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Vendu
              </div>
            ) : (
              <BuyButton productId={product.id} />
            )}
            <Link href={`/chat/${product.seller.id}`} className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-primary"
              >
                <MessageCircle />
                Chat avec le vendeur
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Barre d'actions fixe en bas - mobile uniquement */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-3 md:hidden">
        <div className="flex gap-2.5">
          {product.isSold ? (
            <div className="flex-1 rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Vendu
            </div>
          ) : (
            <div className="flex-1">
              <BuyButton productId={product.id} />
            </div>
          )}
          <Link href={`/chat/${product.seller.id}`} className="flex-1">
            <Button size="lg" variant="outline" className="w-full text-primary">
              <MessageCircle />
              Chat avec le vendeur
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
