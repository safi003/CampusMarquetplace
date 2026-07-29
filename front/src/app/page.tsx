import { Product } from "@/types/product";
import Text3DFlip from "@/components/ui/text-3d-flip";
import HeroCTA from "@/components/hero-cta";
import HowItWorks from "@/components/how-it-works";
import { CategoryProductCarousel } from "@/components/category-product-carousel";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");
  return res.json();
}

function groupByCategory(products: Product[]): Map<string, Product[]> {
  const grouped = new Map<string, Product[]>();
  for (const product of products) {
    const catName = product.category.name;
    if (!grouped.has(catName)) grouped.set(catName, []);
    grouped.get(catName)!.push(product);
  }
  return grouped;
}

export default async function HomePage() {
  const products = await getProducts();
  const grouped = groupByCategory(products);

  return (
    <div className="space-y-16">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <Text3DFlip
          className="text-[#D4A017] text-3xl sm:text-5xl font-bold flex justify-center flex-wrap"
          textClassName="text-[#D4A017]"
          flipTextClassName="text-[#D4A017]"
          rotateDirection="top"
        >
          Achetez et vendez a petit prix 
        </Text3DFlip>

        <p className="max-w-xl text-muted-foreground text-lg">
          Campus Marketplace Trouvez les meilleurs deals sur du matériel de cours, de l&apos;électronique et bien plus encore.
        </p>

        <HeroCTA />
      </section>

      <HowItWorks />

      {products.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Aucun produit pour le moment.</p>
      ) : (
        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([categoryName, categoryProducts]) => (
            <CategoryProductCarousel
              key={categoryName}
              categoryName={categoryName}
              products={categoryProducts}
            />
          ))}
        </div>
      )}
    </div>
  );
}