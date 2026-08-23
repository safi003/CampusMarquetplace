"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/app/lib/api";

export default function WishlistButton({ productId }: { productId: number }) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  useEffect(() => {
    if (!token) return;

    apiFetch(`/wishlist`)
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((items) => {
        if (Array.isArray(items)) {
          setLiked(items.some((item: { productId: number }) => item.productId === productId));
        }
      })
      .catch(() => {});
  }, [productId, token]);

  async function handleClick() {
    if (!token) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 3000);
      return;
    }

    setLoading(true);

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await apiFetch(`/wishlist/${productId}`, { method });

      if (res.ok) {
        setLiked(!liked);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-3xl transition-colors duration-200 hover:scale-110 disabled:opacity-50"
        title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {liked ? "♥" : "♡"}
      </button>
      {showLoginHint && (
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour ajouter aux favoris.{" "}
          <Link href="/login" className="font-semibold text-[#4AA3A2] underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      )}
    </div>
  );
}