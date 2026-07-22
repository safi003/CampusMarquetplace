"use client";

import { useState, useEffect } from "react";

export default function WishlistButton({ productId }: { productId: number }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((items) => {
        if (Array.isArray(items)) {
          setLiked(items.some((item: any) => item.productId === productId));
        }
      })
      .catch(() => {});
  }, [productId]);

  async function handleClick() {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${productId}`,
        { method, headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        setLiked(!liked);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-3xl transition-colors duration-200 hover:scale-110 disabled:opacity-50"
      title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {liked ? "♥" : "♡"}
    </button>
  );
}