"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/app/lib/api";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";

interface WishlistItem {
  id: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export default function WishlistPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      const res = await apiFetch(`/wishlist`, { cache: "no-store" });
      if (res.ok && active) {
        setItems(await res.json());
      }
      if (active) setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Mes favoris</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length} annonce{items.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}

      {!loading && !token && (
        <p className="text-muted-foreground">
          Connectez-vous pour voir vos favoris.{" "}
          <Link href="/login" className="text-[#4AA3A2] font-semibold underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      )}

      {!loading && token && items.length === 0 && (
        <p className="text-muted-foreground">
          Vous n&apos;avez pas encore de favoris.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}