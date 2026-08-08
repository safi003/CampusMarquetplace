"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CarteScolairePage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError("Choisissez une photo de votre pièce d'identité");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("imageCarteScolaire", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/carte`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la carte");
      }

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.imageCarteScolaire = data.imageCarteScolaire;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vérification de la pièce d&apos;identité</CardTitle>
          <CardDescription>
            Une étape de sécurité pour protéger la communauté
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/20 px-4 py-3 text-sm text-[#D4A017]">
              <span className="font-semibold">Confidentiel :</span> votre pièce d&apos;identité
              sert uniquement à vérifier votre identité. Elle n&apos;est
              jamais visible par les autres utilisateurs.
            </div>

            {user.imageCarteScolaire && (
              <Alert variant="default" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                <AlertDescription>
                  Pièce d&apos;identité déjà ajoutée. Vous pouvez en envoyer une nouvelle pour la remplacer.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                <AlertDescription>
                  Pièce d&apos;identité envoyée. Vous pouvez maintenant publier vos annonces.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="carte">Photo de la pièce d&apos;identité</Label>
              <Input
                id="carte"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-10 file:mr-2 file:h-6 file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-xs file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Formats acceptés : JPG, PNG, WEBP. La photo doit montrer clairement votre nom.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer ma pièce d'identité"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => router.push("/products")}
            >
              Retour à la publication
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
