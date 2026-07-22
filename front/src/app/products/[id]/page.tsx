import { Product } from "@/types/product";
import WishlistButton from "@/components/wishlistButton";

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
      {/* Galerie d'images */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {product.images.map((img) => (
          <img
            key={img.id}
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${img.url}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded"
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-500">{product.category.name}</p>
      <p className="text-xl font-semibold mt-2">{product.price} FCFA</p>
      <p className="mt-4">{product.description}</p>
      <p className="text-sm text-gray-400 mt-2">Vendu par {product.seller.name}</p>

      <div className="mt-6">
        <WishlistButton productId={product.id} />
      </div>
    </div>
  );
}