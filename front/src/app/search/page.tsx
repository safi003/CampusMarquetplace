import { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";
import { Search } from "lucide-react";

async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Rechercher un produit</h1>
        <p className="mt-2 text-muted-foreground">
          Utilisez la barre de recherche pour trouver ce que vous cherchez.
        </p>
      </div>
    );
  }

  const products = await searchProducts(query);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Résultats pour &laquo; {query} &raquo;
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} annonce{products.length > 1 ? "s" : ""} trouvée{products.length > 1 ? "s" : ""}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Aucun produit trouvé pour &laquo; {query} &raquo;.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Essayez avec d&apos;autres mots-clés.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
