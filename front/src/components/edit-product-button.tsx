"use client"

import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Pencil } from "lucide-react"

interface EditProductButtonProps {
  productId: number
  sellerId: number
}

export function EditProductButton({ productId, sellerId }: EditProductButtonProps) {
  const { user } = useAuth()

  if (!user || user.id !== sellerId) return null

  return (
    <Link
      href={`/products/${productId}/edit`}
      className="text-3xl transition-all duration-200 hover:scale-110 text-gray-500 hover:text-gray-700"
      title="Modifier le produit"
    >
      <Pencil className="w-7 h-7" />
    </Link>
  )
}