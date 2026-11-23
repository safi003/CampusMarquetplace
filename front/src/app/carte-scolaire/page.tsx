"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/app/lib/api";
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

const statusLabel: Record<string, { text: string; className: string }> = {
  PENDING: {
    text: "En attente de vérification",
    className: "border-[#4AA3A2]/30 bg-[#4AA3A2]/10 text-[#2F7372]",
  },
  APPROVED: {
    text: "Compte vérifié",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  REJECTED: {
    text: "Pièce refusée",
    className: "border-red-500/30 bg-red-500/10 text-red-700",
  },
};

export default function CarteScolairePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
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
      const res = await apiFetch(`/auth/carte`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la carte");
      }

      await refreshUser();
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
            <div className="rounded-lg border border-[#4AA3A2]/20 bg-[#4AA3A2]/10 px-4 py-3 text-sm text-[#4AA3A2]">
              <span className="font-semibold">Confidentiel :</span> votre pièce d&apos;identité
              sert uniquement à vérifier votre identité. Elle n&apos;est
              jamais visible par les autres utilisateurs.
            </div>

            <div className="flex flex-wrap gap-2">
              {user.cardStatus && statusLabel[user.cardStatus] && (user.cardStatus !== "PENDING" || !!user.imageCarteScolaire) && (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusLabel[user.cardStatus].className}`}
                >
                  {statusLabel[user.cardStatus].text}
                </span>
              )}
              {user.imageCarteScolaire && (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
                  Pièce d&apos;identité envoyée
                </span>
              )}
              {!user.imageCarteScolaire && (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Aucune pièce envoyée
                </span>
              )}
            </div>

            {user.cardStatus === "PENDING" && !!user.imageCarteScolaire && (
              <Alert className="border-[#4AA3A2]/30 bg-[#4AA3A2]/10 text-[#2F7372]">
                <AlertDescription>
                  Votre pièce d&apos;identité est en attente de vérification. Un administrateur va la vérifier. Vous pourrez publier des annonces une fois votre compte validé.
                </AlertDescription>
              </Alert>
            )}
            {user.cardStatus === "APPROVED" && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                <AlertDescription>
                  Votre compte est vérifié. Vous pouvez publier des annonces.
                </AlertDescription>
              </Alert>
            )}
            {user.cardStatus === "REJECTED" && (
              <Alert variant="destructive">
                <AlertDescription>
                  Votre pièce d&apos;identité a été refusée : {user.cardRejectionReason || "motif non précisé"}. Envoyez une
                  nouvelle photo pour être revalidé.
                </AlertDescription>
              </Alert>
            )}

            {user.imageCarteScolaire && user.cardStatus === "APPROVED" && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                <AlertDescription>
                  Une pièce d&apos;identité est enregistrée sur votre compte. Vous pouvez en envoyer une nouvelle si nécessaire.
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
                  Pièce d&apos;identité envoyée. Votre compte est en attente de vérification par un administrateur.
                </AlertDescription>
              </Alert>
            )}

            {(user.cardStatus !== "PENDING" || !user.imageCarteScolaire) && user.cardStatus !== "APPROVED" && (
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
            )}
          </CardContent>
          {user.cardStatus === "PENDING" && !!user.imageCarteScolaire ? (
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Retour à l&apos;accueil
              </Button>
            </CardFooter>
          ) : user.cardStatus === "APPROVED" ? (
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push("/products")}
              >
                Déposer une annonce
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Retour à l&apos;accueil
              </Button>
            </CardFooter>
          ) : (
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer ma pièce d'identité"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => router.push("/")}
              >
                Retour à l&apos;accueil
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
