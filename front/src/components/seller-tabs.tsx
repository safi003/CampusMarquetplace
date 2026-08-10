"use client";

import { useState } from "react";
import Link from "next/link";
import StarRating from "@/components/star-rating";
import ReviewFormWrapper from "@/components/review-form-wrapper";
import { Product } from "@/types/product";

interface Seller {
  id: number;
  name: string;
  createdAt: string;
  _count: { products: number };
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: number; name: string };
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function MemberSince({ date }: { date: string }) {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SellerTabs({
  seller,
  products,
  reviewsData,
  sellerId,
}: {
  seller: Seller | null;
  products: Product[];
  reviewsData: ReviewsData;
  sellerId: number;
}) {
  const [tab, setTab] = useState<"annonces" | "avis">("annonces");
  const name = seller?.name || (products.length > 0 ? products[0].seller.name : "Vendeur");

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4AA3A2]/10 text-2xl font-bold text-[#4AA3A2]">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {seller ? <MemberSince date={seller.createdAt} /> : ""}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={reviewsData.averageRating} />
              <span className="text-sm text-muted-foreground">
                ({reviewsData.totalReviews} avis)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#4AA3A2]">{products.length}</p>
            <p className="text-xs text-muted-foreground">annonce{products.length > 1 ? "s" : ""} active{products.length > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        <button
          onClick={() => setTab("annonces")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "annonces"
              ? "bg-card border border-border border-b-white text-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          Annonces ({products.length})
        </button>
        <button
          onClick={() => setTab("avis")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "avis"
              ? "bg-card border border-border border-b-white text-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          Avis ({reviewsData.totalReviews})
        </button>
      </div>

      {tab === "annonces" && (
        <div>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Aucune annonce pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {product.images[0] && (
                    <div className="relative overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`}
                        alt={product.name}
                        className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <span className="inline-block rounded-full bg-[#4AA3A2]/10 px-2 py-0.5 text-xs font-medium text-[#4AA3A2]">
                      {product.category.name}
                    </span>
                    <h3 className="mt-1 font-semibold text-sm">{product.name}</h3>
                    <p className="mt-2 text-base font-bold text-[#4AA3A2]">{product.price} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "avis" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {reviewsData.reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Aucun avis pour le moment.</p>
            ) : (
              reviewsData.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{review.reviewer.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div>
            <div className="rounded-2xl border border-border bg-card p-5 sticky top-6">
              <ReviewFormWrapper sellerId={sellerId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
