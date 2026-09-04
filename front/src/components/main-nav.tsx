"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Search,
  Heart,
  PlusCircle,
  Smartphone,
  BookOpen,
  Shirt,
  Sofa,
  Bike,
  Utensils,
  Dumbbell,
  Laptop,
  Music,
  Ellipsis,
  ShieldCheck,
} from "lucide-react";
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

const navItems = [{ name: "Accueil", link: "/" }];

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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isAdmin = user?.role === "ADMIN";
  const showVerifyBanner =
    user &&
    !isAdmin &&
    user.imageCarteScolaire &&
    (user.cardStatus === "PENDING" || user.cardStatus === "REJECTED");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Non connecté -> connexion ; sans pièce d'identité valide -> carte scolaire ; sinon publication
  const publishHref = !user ? "/login" : !user.imageCarteScolaire || user.cardStatus === "REJECTED" || user.cardStatus === "PENDING"
      ? "/carte-scolaire"
      : "/products";

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <Navbar>
          <NavBody>
            <Link
              href="/"
              className="relative z-20 flex shrink-0 items-center px-1 py-1 text-sm font-normal"
            >
              <span className="font-bold tracking-tight text-3xl text-[#4AA3A2]">
                Campus Marketplace
              </span>
            </Link>

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-3">

              <form onSubmit={handleSearch} className="relative hidden min-w-0 lg:block ">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-52 border-[#4AA3A2] rounded-full border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 xl:w-64"
                />
              </form>
              <NavbarButton
                href={publishHref}
                variant="primary"
                className="bg-[#4AA3A2]"
              >
                <PlusCircle className="mr-1 inline h-4 w-4" />
                Déposer une annonce
              </NavbarButton>

              <nav className="hidden items-center gap-1 border-l border-border pl-3 lg:flex">
                {/* {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))} */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex h-12 min-w-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-xs font-medium leading-tight text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/wishlist"
                  className="inline-flex h-12 min-w-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-xs font-medium leading-tight text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Heart className="h-4 w-4" /> Favoris
                </Link>
                {user && (
                  <MessagesNavLink className="h-12 min-w-[3.75rem] flex-col justify-center gap-0.5 rounded-lg px-2 text-xs leading-tight hover:bg-muted" />
                )}
                {user && (
                  <NotificationsNavLink className="h-12 min-w-[3.75rem] flex-col justify-center gap-0.5 rounded-lg px-2 text-xs leading-tight hover:bg-muted" />
                )}
              </nav>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((open) => !open)}
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Ouvrir le menu utilisateur"
                    title="Menu utilisateur"
                    className="inline-flex h-12 min-w-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-xs leading-tight text-gray-600 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                    <span className="max-w-28 truncate">{user.name}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-border bg-background p-1 shadow-lg"
                    >
                      <Link
                        href={`/sellers/${user.id}`}
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Voir le profil
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavbarButton
                  href="/login"
                  variant="secondary"
                  className="bg-white text-[#4AA3A2] border-[#4AA3A2] hover:bg-[#4AA3A2] hover:text-white"
                >
                  <User className="mr-1 inline h-4 w-4" />
                  Se connecter
                </NavbarButton>
              )}
            </div>
          </NavBody>

          <MobileNav>
            <MobileNavHeader>
              <Link
                href="/"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                <span className="text-[#4AA3A2] site-mobile-wordmark">Campus Marketplace</span>
              </Link>
              <MobileNavToggle
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              />
            </MobileNavHeader>
            <div className="site-mobile-search w-full px-4 pt-3 pb-2">
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
                <NavbarButton
                  href={publishHref}
                  variant="primary"
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-1 inline" />
                  Déposer une annonce
                </NavbarButton>
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen((open) => !open)}
                      aria-expanded={isProfileMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Ouvrir le menu utilisateur"
                      title="Menu utilisateur"
                      className="flex w-full items-center justify-center rounded-lg px-2 py-2 text-gray-600 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                      <span className="max-w-full truncate">{user.name}</span>
                    </button>
                    {isProfileMenuOpen && (
                      <div
                        role="menu"
                        className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border border-border bg-background p-1 shadow-lg"
                      >
                        <Link
                          href={`/sellers/${user.id}`}
                          role="menuitem"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsOpen(false);
                          }}
                          className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          Voir le profil
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavbarButton
                    href="/login"
                    variant="secondary"
                    className="h-12 w-full flex-col gap-0.5 px-2 text-xs leading-tight"
                  >
                    <User className="h-5 w-5" />
                    Se connecter
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
          <Link
            href="/carte-scolaire"
            className="font-semibold underline underline-offset-2"
          >
            Envoyer une nouvelle pi&egrave;ce d&apos;identit&eacute;
          </Link>
        </div>
      )}

      <div className="flex items-center font-bold justify-start gap-1 px-4 py-2 overflow-x-auto max-w-[100vw] flex-nowrap border-b border-border bg-card/50">
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
