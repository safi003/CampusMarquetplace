"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoryNotFound() {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((categories: Category[]) => {
        if (active) setCategory(categories.find((c) => c.slug === slug) ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <p className="text-6xl font-bold text-[#D4A017]">404</p>
      <h1 className="text-2xl font-semibold text-foreground">
        {loading
          ? "Chargement..."
          : category
            ? "Aucune annonce dans cette catégorie pour le moment"
            : "Catégorie introuvable"}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {category
          ? "Revenez plus tard, une annonce sera peut-être publiée prochainement."
          : "La catégorie que vous recherchez n'existe pas."}
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
