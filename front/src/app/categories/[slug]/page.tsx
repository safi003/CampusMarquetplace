import { notFound } from "next/navigation";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";

interface Category {
  id: number;
  name: string;
  slug: string;
}

async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const categories: Category[] = await res.json();
  return categories.find((c) => c.slug === slug) ?? null;
}

async function getCategoryProducts(categoryId: number): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?categoryId=${categoryId}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const products = await getCategoryProducts(category.id);

  if (products.length === 0) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Annonces {category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} annonce{products.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
