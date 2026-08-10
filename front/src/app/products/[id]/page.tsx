import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import WishlistButton from "@/components/wishlistButton";
import { DeleteProductButton } from "@/components/delete-product-button";
import { EditProductButton } from "@/components/edit-product-button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            <p className="text-sm text-gray-400">Vendu par <Link href={`/sellers/${product.seller.id}`} className="hover:text-[#4AA3A2] hover:underline">{product.seller.name}</Link></p>
          </div>
        </div>

        {/* Profil du vendeur + actions */}
        <div className="md:w-1/3 self-start flex flex-col gap-5 rounded-xl border border-border bg-card p-5 max-h-80 overflow-y-auto">
         
          {/* Profil du vendeur */}
          <Link
            href={`/sellers/${product.seller.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4AA3A2]/15 text-[#4AA3A2] font-semibold">
              {product.seller.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{product.seller.name}</p>
              <p className="text-xs text-muted-foreground">Voir le profil du vendeur</p>
            </div>
          </Link>

          <div className="flex flex-col gap-2.5">
            <Button size="lg" className="w-full">
              <ShoppingCart />
              Acheter
            </Button>
            <Button size="lg" variant="outline" className="w-full">
              <MessageCircle />
              Chat avec le vendeur
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <WishlistButton productId={product.id} />
            <DeleteProductButton productId={product.id} sellerId={product.seller.id} />
            <EditProductButton productId={product.id} sellerId={product.seller.id} />
          </div>
        </div>
      </div>
    </div>
  );
}