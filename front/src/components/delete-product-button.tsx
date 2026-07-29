"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Trash2 } from "lucide-react"

interface DeleteProductButtonProps {
  productId: number
  sellerId: number
}

export function DeleteProductButton({ productId, sellerId }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  if (!user || user.id !== sellerId) return null

  async function handleDelete() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      setOpen(false)
      router.push("/")
      router.refresh()
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-3xl transition-all duration-200 hover:scale-110 text-red-500 hover:text-red-600"
        title="Supprimer le produit"
      >
        <Trash2 className="w-7 h-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
