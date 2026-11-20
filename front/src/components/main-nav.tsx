"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
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
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import NavbarComponent from "@/components/ui/resizable-navbar";

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
      <NavbarComponent />

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
