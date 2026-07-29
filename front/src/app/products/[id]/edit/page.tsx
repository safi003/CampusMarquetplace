"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

interface Category {
  id: number
  name: string
  slug: string
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, token } = useAuth()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [address, setAddress] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user || !token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((product) => {
        if (product.seller.id !== user.id) {
          router.push("/")
          return
        }
        setName(product.name)
        setDescription(product.description)
        setPrice(String(product.price))
        setAddress(product.address)
        setCategoryId(String(product.category.id))
      })
      .catch(() => router.push("/"))
      .finally(() => setLoadingData(false))
  }, [id, user, token, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, price, categoryId, address }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Erreur lors de la modification")
      }

      router.push(`/products/${id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <p className="text-center py-12 text-muted-foreground">Chargement...</p>

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Modifier le produit</CardTitle>
          <CardDescription>Modifiez les informations de votre annonce</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Adresse de retrait</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Prix</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="categoryId">Catégorie</Label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                >
                  <option value="" disabled>Choisir une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}