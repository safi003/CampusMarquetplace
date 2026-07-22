"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] lg:flex lg:min-h-full lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
        <svg viewBox="0 0 40 40" fill="none" className="size-16 text-white">
          <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 28V16l8-6 8 6v12h-6v-6h-4v6h-6z" fill="currentColor" />
        </svg>
        <h2 className="text-2xl font-semibold text-white">Campus Marketplace</h2>
        <p className="max-w-sm text-base leading-relaxed text-slate-300">
          Achetez et vendez en toute confiance. Trouvez les meilleurs prix sur les livres, fournitures et plus encore.
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <span className="text-2xl font-bold text-white">500+</span>
            <span className="mt-0.5 text-xs text-slate-400">vendeur</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <span className="text-2xl font-bold text-white">1k+</span>
            <span className="mt-0.5 text-xs text-slate-400">Annonces</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <span className="text-2xl font-bold text-white">50+</span>
            <span className="mt-0.5 text-xs text-slate-400">Campus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="fixed inset-0 z-40 grid overflow-y-auto bg-background lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-full flex-col pt-14">
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="flex w-full max-w-[400px] flex-col gap-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <Link href="/" className="mb-2 flex items-center gap-2.5">
                <svg viewBox="0 0 40 40" fill="none" className="size-10 text-primary">
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
