import Link from "next/link";
import { Product } from "@/types/product";
import Text3DFlip from "@/components/ui/text-3d-flip";
import HeroCTA from "@/components/hero-cta";
import HowItWorks from "@/components/how-it-works";
import {
  Smartphone,
  BookOpen,
  Shirt,
  Sofa,
  Bike,
  Ellipsis,
} from "lucide-react";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");
  return res.json();
}

const categories = [
  { name: "Électronique", icon: Smartphone, slug: "electronique" },
  { name: "Livres", icon: BookOpen, slug: "livres" },
  { name: "Vêtements", icon: Shirt, slug: "vetements" },
  { name: "Meubles", icon: Sofa, slug: "meubles" },
  { name: "Vélos & Transport", icon: Bike, slug: "transport" },
  { name: "Autres", icon: Ellipsis, slug: "autres" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-16">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <Text3DFlip
          className="text-[#D4A017] text-3xl sm:text-5xl font-bold flex justify-center flex-wrap"
          textClassName="text-[#D4A017]"
          flipTextClassName="text-[#D4A017]"
          rotateDirection="top"
        >
          Achetez et vendez entre étudiants
        </Text3DFlip>

        <p className="max-w-xl text-muted-foreground text-lg">
          La marketplace des étudiants. Trouvez les meilleurs deals sur du matériel de cours, de l&apos;électronique et bien plus encore.
        </p>

        <HeroCTA />
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold text-foreground flex">Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-[#D4A017] hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4A017]/10 text-[#D4A017] transition-colors group-hover:bg-[#D4A017] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <HowItWorks />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Produits récents</h2>
          <Link href="/products" className="text-sm font-medium text-[#D4A017] hover:underline">
            Voir tout →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Aucun produit pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <Link href={`/products/${product.id}`}>
                  {product.images[0] && (
                    <div className="relative overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`}
                        alt={product.name}
                        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-block rounded-full bg-[#D4A017]/10 px-2.5 py-0.5 text-xs font-medium text-[#D4A017]">
                      {product.category.name}
                    </span>
                    <h3 className="mt-2 font-semibold text-foreground">{product.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold text-[#D4A017]">{product.price} FCFA</p>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Link href={`/sellers/${product.seller.id}`} className="text-xs text-muted-foreground hover:text-[#D4A017] hover:underline">par {product.seller.name}</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}