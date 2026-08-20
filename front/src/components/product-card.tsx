"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images?.[0]
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`
    : null;

  return (
    <motion.a
      href={`/products/${product.id}`}
      className="relative flex-shrink-0 w-[300px] h-[380px] rounded-2xl overflow-hidden group snap-start bg-card border border-border"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-2/4 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 w-full h-2/4 bg-muted flex items-center justify-center text-muted-foreground">
          Aucune image
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-2/4 bg-card p-5 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-card-foreground leading-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-lg font-bold text-[#4AA3A2]">{product.price} FCFA</p>
            <p className="text-xs text-muted-foreground">{product.seller.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-[#4AA3A2] group-hover:text-white">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
