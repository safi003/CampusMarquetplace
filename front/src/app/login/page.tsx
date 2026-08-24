"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/app/lib/api";
import { useAuth } from "@/contexts/auth-context";
import AuthLayout from "@/components/auth-layout";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSafeRedirect } from "@/lib/safe-redirect";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingInfo, setPendingInfo] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("verify")) {
      const id = setTimeout(() => setPendingInfo(true), 0);
      return () => clearTimeout(id);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(email, password);
      login(data.user, data.token);
      router.push(getSafeRedirect());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {pendingInfo && (
          <Alert className="border-[#4AA3A2]/30 bg-[#4AA3A2]/10 text-[#4AA3A2]">
            <AlertDescription>
              Votre compte sera vérifié par un administrateur avant de pouvoir publier des annonces.
            </AlertDescription>
          </Alert>
        )}
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
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
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
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Mot de passe
              </Label>
            </div>
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

        <Button
          type="submit"
          className="h-10 w-full text-sm font-semibold"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Pas de compte ?
          <a
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            S&apos;inscrire
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
