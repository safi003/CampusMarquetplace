"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { Product } from "@/types/product"
import { ProductCard } from "@/components/product-card"

interface CategoryCarouselProps {
  categoryName: string
  products: Product[]
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
          href={`/categories/${products[0].category.slug}`}
          className="text-sm font-medium text-[#4AA3A2] hover:underline"
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
