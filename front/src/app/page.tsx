import Link from "next/link";
import { Product } from "@/types/product";
import Text3DFlip from "@/components/ui/text-3d-flip"
import {Button} from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");
  return res.json();
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="">
      <Text3DFlip
  className="bg-background text-foreground text-5xl font-bold mb-6 text-center"
  textClassName="bg-background text-foreground"
  flipTextClassName="bg-background text-foreground"
  rotateDirection="top"
>
  Achetez et vendez vos produits a petit prix
</Text3DFlip>
      
      <div className="flex justify-center mb-6">
        <Button type="submit" className="border-1 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-2">
          <PlusCircle className="mr-2 h-5 w-5" />
          Deposer une annonce
        </Button>
      </div>
      {products.length === 0 ? (
        <p className="text-gray-500">Aucun produit pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {product.images[0] && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category.name}</p>
              <p className="font-semibold mt-2">{product.price} FCFA</p>
              <p className="text-xs text-gray-400">Vendu par {product.seller.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}