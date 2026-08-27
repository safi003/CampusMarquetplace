"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function BrandPanel() {
  return (
    <div className="order-1 relative hidden overflow-hidden bg-gradient-to-br from-[#4AA3A2] via-[#388C8B] to-[#2A6B6A] lg:flex lg:h-full lg:w-1/2 lg:items-center lg:justify-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-white/10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
        <svg viewBox="0 0 40 40" fill="none" className="size-16 text-white">
          <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.2" />
          <path d="M12 28V16l8-6 8 6v12h-6v-6h-4v6h-6z" fill="white" />
        </svg>
        <h2 className="text-2xl font-semibold text-white drop-shadow-sm">
          Campus Marketplace
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-white/90">
          Achetez et vendez en toute confiance. Trouvez les meilleurs prix sur
          les livres, fournitures et plus encore.
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/15 px-5 py-3 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">500+</span>
            <span className="mt-0.5 text-xs text-white/80">vendeur</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/15 px-5 py-3 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">1k+</span>
            <span className="mt-0.5 text-xs text-white/80">Annonces</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-white/20 bg-white/15 px-5 py-3 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">50+</span>
            <span className="mt-0.5 text-xs text-white/80">Campus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="fixed inset-0 z-40 flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg lg:bg-white lg:text-[#4AA3A2] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:left-6 lg:top-6"
      >
        <ArrowLeft className="h-4 w-4 lg:text-[#4AA3A2]" />
        Retour
      </Link>
      <div className="order-2 flex min-h-0 flex-1 flex-col overflow-y-auto pt-9 lg:h-full lg:w-1/2 lg:pt-0">
        <div className="flex min-h-full flex-1 items-start justify-center px-4 py-3 lg:min-h-0 lg:pt-3">
          <div className="flex w-full max-w-[400px] flex-col gap-7">
            <div className="flex flex-col items-center gap-3 text-center">
              <Link href="/" className="mb-2 flex items-center gap-2.5">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  className="size-10 text-primary"
                >
                  <rect width="40" height="40" rx="10" fill="currentColor" />
                  <path d="M12 28V16l8-6 8 6v12h-6v-6h-4v6h-6z" fill="white" />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                {isLogin ? "Connexion" : "Inscription"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Bienvenue ! Connectez-vous pour continuer."
                  : "Créez votre compte pour commencer."}
              </p>
            </div>

            <div className="flex overflow-hidden rounded-lg border border-border bg-secondary p-1">
              <Link
                href="/register"
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors ${
                  !isLogin
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inscription
              </Link>
              <Link
                href="/login"
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors ${
                  isLogin
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Connexion
              </Link>
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>

      <BrandPanel />
    </div>
  );
}
