"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [handDelivery, setHandDelivery] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Non connecté -> connexion ; sans pièce d'identité valide -> carte scolaire
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    if (user && (!user.imageCarteScolaire || user.cardStatus === "REJECTED")) {
      router.replace("/carte-scolaire");
    }
  }, [user, router]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (files.length === 0) {
      setError("Ajoute au moins une photo");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", categoryId);
    formData.append("address", address);
    formData.append("handDelivery", String(handDelivery));
    files.forEach((file) => formData.append("images", file));

    try {
      const res = await apiFetch(`/products`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.status === 403) {
        router.push("/carte-scolaire");
        return;
      }
      if (!res.ok) {
        const msg =
          data.message ||
          Object.values(data.errors || {})
            .flat()
            .join(", ") ||
          "Erreur lors de la création";
        throw new Error(msg);
      }

      router.push(`/products/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Publier un produit</CardTitle>
          <CardDescription>Mettez en vente un article</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg bg-[#4AA3A2]/10 border border-[#4AA3A2]/20 px-4 py-3 text-sm text-[#4AA3A2]">
              <span className="font-semibold">Conseil :</span> Prenez plusieurs photos claires de votre article sous différents angles pour éviter toute confusion avec les acheteurs.
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                placeholder="Ex: Macbook Pro 2022"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre article en détail sa aidera dans la recherche..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Adresse de retrait</Label>
              <Input
                id="address"
                placeholder="Ex: Campus de l'Université, Bâtiment A"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Prix </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
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
               <div className="flex items-center gap-2">
              <input
                id="handDelivery"
                type="checkbox"
                checked={handDelivery}
                onChange={(e) => setHandDelivery(e.target.checked)}
                className="h-4 w-4 accent-[#4AA3A2]"
              />
              <Label htmlFor="handDelivery">
                J&apos;accepte la remise en main propre
              </Label>
            </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="images">Photos (max 5)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="file:mr-2 file:h-6 file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-xs file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
              />
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Publication..." : "Publier"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
