"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.message ||
          Object.values(data.errors || {}).flat().join(", ") ||
          "Erreur lors de l'inscription";
        throw new Error(msg);
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <GoogleSignInButton onError={setError} />

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Nom complet
            </Label>
            <Input
              id="name"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@univ.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
          </div>
        </div>

        <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={loading}>
          {loading ? "Inscription..." : "S'inscrire"}
        </Button>

        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Déjà un compte ?
          <a href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
