"use client";

import { useState } from "react";

interface GithubSignInButtonProps {
  onError?: (message: string) => void;
}

export function GithubSignInButton({
  onError,
}: GithubSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleGithubLogin() {
    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("URL de l'API introuvable");
      }

      // Redirige le navigateur vers notre backend.
      // Le backend s'occupe ensuite de l'authentification GitHub.
      window.location.href = `${apiUrl}/auth/github`;
    } catch (err) {
      setLoading(false);

      onError?.(
        err instanceof Error
          ? err.message
          : "Erreur lors de la connexion GitHub"
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleGithubLogin}
      disabled={loading}
      className="flex h-10 w-30 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        "Connexion..."
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18A10.9 10.9 0 0 1 12 5.12c.97 0 1.94.13 2.85.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.08.78 2.18v3.24c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>

          GitHub
        </>
      )}
    </button>
  );
}

