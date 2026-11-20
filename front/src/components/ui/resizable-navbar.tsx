"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import MessagesNavLink from "@/components/messages-nav-link";
import NotificationsNavLink from "@/components/notifications-nav-link";

export default function NavbarComponent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const showVerifyBanner =
    user &&
    !isAdmin &&
    user.imageCarteScolaire &&
    (user.cardStatus === "PENDING" || user.cardStatus === "REJECTED");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const publishHref = !user
    ? "/login"
    : !user.imageCarteScolaire || user.cardStatus === "REJECTED"
      ? "/carte-scolaire"
      : "/products";

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white/85 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 lg:px-8">
          <Link
            className="shrink-0 text-[1.35rem] font-black tracking-[-0.06em] text-[#171717]"
            href="/"
            aria-label="Campus Marketplace home"
          >
            campus<span className="text-primary">market</span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              Accueil
            </Link>
            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                Explorer{" "}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-10 mt-2 w-52 translate-y-1 border border-border bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href="/products"
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary"
                >
                  Tous les produits
                </Link>
                <Link
                  href="/categories"
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary"
                >
                  Catégories
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-primary/10 hover:text-primary"
                >
                  Mes favoris
                </Link>
              </div>
            </div>
            <Link
              href="/products"
              className="rounded-md px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              Bonnes affaires
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-primary/10 hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                aria-label="Rechercher un produit"
                className="w-40 border-b border-neutral-300 bg-transparent py-2 pl-9 pr-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-primary"
              />
            </form>
            {user && <MessagesNavLink className="px-2 py-2" />}
            {user && <NotificationsNavLink className="px-2 py-2" />}
            <Link
              href={user ? "#" : "/login"}
              className="px-3 py-2 text-sm font-semibold text-neutral-700 hover:text-primary"
            >
              {user ? user.name : "Connexion"}
            </Link>
            <Link
              href={publishHref}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3A8382]"
            >
              {" "}
              <Plus className="h-4 w-4" />
              Vendre <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Déconnexion"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-2 text-neutral-700 hover:bg-primary/10 lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-white px-5 pb-5 pt-3 lg:hidden">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-sm font-semibold text-neutral-700"
              >
                Accueil
              </Link>
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-sm font-semibold text-neutral-700"
              >
                Explorer les produits
              </Link>
              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-sm font-semibold text-neutral-700"
              >
                Catégories
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-sm font-semibold text-neutral-700"
              >
                Favoris
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-3 text-sm font-semibold text-neutral-700"
                >
                  Administration
                </Link>
              )}
            </nav>
            <form onSubmit={handleSearch} className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit"
                aria-label="Rechercher un produit"
                className="w-full border border-border bg-neutral-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </form>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href={publishHref}
                onClick={() => setMenuOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white"
              >
                {" "}
                <Plus className="h-4 w-4" />
                Vendre
              </Link>
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-neutral-700"
                >
                  Connexion
                </Link>
              )}
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-2 py-2.5 text-sm font-semibold text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sortir
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {showVerifyBanner && (
        <div
          className={`px-4 py-2 text-center text-sm ${
            user.cardStatus === "REJECTED"
              ? "bg-red-50 text-red-700 border-b border-red-200"
              : "bg-[#4AA3A2]/10 text-[#2F7372] border-b border-[#4AA3A2]/20"
          }`}
        >
          {user.cardStatus === "REJECTED"
            ? `Votre pièce d'identité a été refusée : ${user.cardRejectionReason || "motif non précisé"}. `
            : "Votre pièce d'identité est en attente de vérification. "}
          <Link
            href="/carte-scolaire"
            className="font-semibold underline underline-offset-2"
          >
            Envoyer une nouvelle pièce d&apos;identité
          </Link>
        </div>
      )}
    </>
  );
}
