"use client";

import { useState } from "react";
import { apiFetch } from "@/app/lib/api";

interface ReviewFormProps {
  sellerId: number;
  onReviewAdded: () => void;
}

export default function ReviewForm({ sellerId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour laisser un avis");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch(`/reviews/${sellerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de l'envoi");
      }

      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium">Laisser un avis</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-colors"
          >
            {star <= (hover || rating) ? (
              <span className="text-[#4AA3A2]">&#9733;</span>
            ) : (
              <span className="text-gray-300">&#9733;</span>
            )}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Votre commentaire (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#4AA3A2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4AA3A2]/90 disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Publier l'avis"}
      </button>
    </form>
  );
}
