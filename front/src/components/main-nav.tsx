"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, Search, Heart, PlusCircle, Smartphone, BookOpen, Shirt, Sofa, Bike, Utensils, Dumbbell, Laptop, Music, Ellipsis, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import MessagesNavLink from "@/components/messages-nav-link";
import NotificationsNavLink from "@/components/notifications-nav-link";
import {
  Navbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Accueil", link: "/" },
];

const categories = [
  { name: "Électronique", icon: Smartphone, slug: "electronique" },
  { name: "Vêtements", icon: Shirt, slug: "vetements" },
  { name: "Livres", icon: BookOpen, slug: "livres" },
  { name: "Meubles", icon: Sofa, slug: "meubles" },
  { name: "Cuisine", icon: Utensils, slug: "cuisine" },
  { name: "Sport", icon: Dumbbell, slug: "sport" },
  { name: "Informatique", icon: Laptop, slug: "informatique" },
  { name: "Musique", icon: Music, slug: "musique" },
  { name: "Vélos", icon: Bike, slug: "velos" },
  { name: "Autres", icon: Ellipsis, slug: "autres" },
];

export default function MainNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const showVerifyBanner =
    user &&
    !isAdmin &&
    user.imageCarteScolaire &&
    (user.cardStatus === "PENDING" || user.cardStatus === "REJECTED");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Non connecté -> connexion ; sans pièce d'identité valide -> carte scolaire ; sinon publication
  const publishHref = !user
    ? "/login"
    : !user.imageCarteScolaire || user.cardStatus === "REJECTED"
      ? "/carte-scolaire"
      : "/products";

  return (
    <>
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Navbar>
        <NavBody>
          <Link href="/" className="relative z-20 mr-6 flex shrink-0 items-center px-1 py-1 text-sm font-normal">
            <span className="font-semibold tracking-tight text-foreground text-xl">Campus Marketplace</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 relative z-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link
              href="/wishlist"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <Heart className="h-4 w-4" />
              Favoris
            </Link>
            {user && <MessagesNavLink className="px-4 py-2" />}
            {user && <NotificationsNavLink className="px-4 py-2" />}
          </nav>

          <form onSubmit={handleSearch} className="relative hidden lg:block z-10 ml-auto mr-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-44 rounded-full border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </form>

          <div className="flex items-center gap-2 relative z-10">
            <NavbarButton href={publishHref} variant="primary">
              <PlusCircle className="h-4 w-4 mr-1 inline" />
              Déposer une annonce
            </NavbarButton>
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.name}</span>
                <NavbarButton as="button" onClick={logout} variant="secondary">
                  <LogOut className="h-4 w-4 mr-1 inline" />
                  Déconnexion
                </NavbarButton>
              </>
            ) : (
              <NavbarButton href="/login" variant="secondary">
                <User className="h-4 w-4 mr-1 inline" />
                Connexion
              </NavbarButton>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
              Campus Marketplace
            </Link>
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          <div className="w-full px-4 pt-3 pb-2 lg:hidden">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </form>
          </div>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className="text-neutral-600 dark:text-neutral-300"
              >
                {item.name}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-neutral-600 dark:text-neutral-300 inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </a>
            )}
            <a
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="text-neutral-600 dark:text-neutral-300 inline-flex items-center gap-1.5"
            >
              <Heart className="h-4 w-4" />
              Favoris
            </a>
            {user && (
              <div onClick={() => setIsOpen(false)}>
                <MessagesNavLink className="px-0" />
              </div>
            )}
            {user && (
              <div onClick={() => setIsOpen(false)}>
                <NotificationsNavLink className="px-0" />
              </div>
            )}
            <div className="flex w-full flex-col gap-2 pt-4">
              <NavbarButton href={publishHref} variant="primary" className="w-full">
                <PlusCircle className="h-4 w-4 mr-1 inline" />
                Déposer une annonce
              </NavbarButton>
              {user ? (
                <>
                  <span className="text-sm text-gray-600 text-center">{user.name}</span>
                  <NavbarButton as="button" onClick={logout} variant="secondary" className="w-full">
                    <LogOut className="h-4 w-4 mr-1 inline" />
                    Déconnexion
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton href="/login" variant="secondary" className="w-full">
                  <User className="h-4 w-4 mr-1 inline" />
                  Connexion
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
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
        <Link href="/carte-scolaire" className="font-semibold underline underline-offset-2">
          Envoyer une nouvelle pi&egrave;ce d&apos;identit&eacute;
        </Link>
      </div>
    )}

      <div className="flex items-center justify-start gap-1 px-4 py-2 overflow-x-auto max-w-[100vw] flex-nowrap border-b border-border bg-card/50">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground rounded-full hover:bg-[#4AA3A2]/10 hover:text-[#4AA3A2] transition-colors flex-shrink-0"
            >
              <Icon className="h-4 w-4" />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </>
  );
}
