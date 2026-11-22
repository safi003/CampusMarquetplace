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
      <section className="flex flex-col items-center gap-6 py-14 text-center sm:py-20">
        <p className="rounded-full border border-[#4AA3A2]/20 bg-[#4AA3A2]/10 px-4 py-2 text-sm font-semibold text-[#2F7372] sm:text-base">
          Tu ne l’utilises plus ? <span className="font-extrabold">Mais vends-le&nbsp;!</span>
        </p>

        <Text3DFlip
          as="h1"
          className="flex justify-center text-balance text-3xl font-bold text-[#4AA3A2] sm:text-5xl"
          textClassName="text-[#4AA3A2]"
          flipTextClassName="text-[#4AA3A2]"
          rotateDirection="top"
        >
          Achetez et vendez à petit prix
        </Text3DFlip>

        <p className="max-w-xl text-lg text-muted-foreground">
          La marketplace pour donner une seconde vie à tes objets et
          trouver de bonnes affaires près de ta ville.
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