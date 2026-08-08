"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              shape?: string;
              text?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    async function handleCredentialResponse(response: { credential: string }) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Erreur lors de la connexion Google");
        }

        login(data.user, data.token);
        router.push("/");
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Erreur lors de la connexion Google");
      }
    }

    function render(id: string) {
      if (!window.google?.accounts?.id || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
      });
    }

    if (window.google?.accounts?.id) {
      render(clientId);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => render(clientId);
    document.head.appendChild(script);
  }, [login, router, onError]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex w-full justify-center">
      <div ref={containerRef} />
    </div>
  );
}
