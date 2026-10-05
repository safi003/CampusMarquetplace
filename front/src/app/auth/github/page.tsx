"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSafeRedirect } from "@/lib/safe-redirect";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    async function handleGithubLogin() {
      const token = searchParams.get("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Récupérer les informations de l'utilisateur
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = await response.json();

        if (!response.ok) {
          throw new Error(
            user.message || "Impossible de récupérer l'utilisateur"
          );
        }

        // Même logique que Google
        login(user, token);

        // Redirection vers la page prévue
        router.replace(getSafeRedirect());
      } catch (error) {
        console.error("Erreur connexion GitHub :", error);
        router.replace("/login");
      }
    }

    handleGithubLogin();
  }, [searchParams, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Connexion avec GitHub...</p>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Connexion avec GitHub...</p>
        </div>
      }
    >
      <GithubCallbackContent />
    </Suspense>
  );
}
