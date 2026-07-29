"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { useRef } from "react"
import { Product } from "@/types/product"

interface CategoryCarouselProps {
  categoryName: string
  products: Product[]
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images[0]
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`
    : null

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
            <p className="text-lg font-bold text-[#D4A017]">{product.price} FCFA</p>
            <p className="text-xs text-muted-foreground">{product.seller.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-[#D4A017] group-hover:text-white">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export function CategoryProductCarousel({ categoryName, products }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      })
    }
  }

  if (products.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">{categoryName}</h2>
        <Link
          href={`/products?category=${products[0].category.slug}`}
          className="text-sm font-medium text-[#D4A017] hover:underline"
        >
          Voir tout →
        </Link>
      </div>
      <div className="relative w-full group">
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  )
}
