import Link from "next/link";
import { notFound } from "next/navigation";
import { Product } from "@/types/product";
import AchatOptions from "@/components/achat-options";

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur lors du chargement du produit");
  return res.json();
}

export default async function AchatPage({
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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Choisissez votre mode d&apos;achat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {product.name} — {product.price} FCFA
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        {product.images[0] && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`}
            alt={product.name}
            className="h-20 w-20 rounded-lg object-cover border"
          />
        )}
        <div>
          <Link href={`/products/${product.id}`} className="font-semibold underline">
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            Vendu par{" "}
            <Link href={`/sellers/${product.seller.id}`} className="text-[#4AA3A2] hover:underline">
              {product.seller.name}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">📍 {product.address}</p>
        </div>
      </div>

      <AchatOptions
        productId={product.id}
        sellerId={product.seller.id}
        handDelivery={product.handDelivery}
      />
    </div>
  );
}