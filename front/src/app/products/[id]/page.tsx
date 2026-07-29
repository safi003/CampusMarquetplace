import Link from "next/link";
import { Product } from "@/types/product";
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

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Produit introuvable");
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Galerie d'images - Carousel */}
      <div className="mb-4">
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
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-500">{product.category.name}</p>
      <p className="text-xl font-semibold mt-2">{product.price} FCFA</p>
      <p className="mt-4">{product.description}</p>
      <p className="text-gray-500">📍 {product.address}</p>
      <p className="text-sm text-gray-400 mt-2">Vendu par <Link href={`/sellers/${product.seller.id}`} className="hover:text-[#D4A017] hover:underline">{product.seller.name}</Link></p>

      <div className="mt-6 flex items-center gap-3">
        <WishlistButton productId={product.id} />
        <DeleteProductButton productId={product.id} sellerId={product.seller.id} />
        <EditProductButton productId={product.id} sellerId={product.seller.id} />
      </div>
    </div>
  );
}