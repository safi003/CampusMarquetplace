"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Accueil", link: "/" },
  { name: "Produits", link: "/products" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <Navbar>
        <NavBody>
          <Link href="/" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal">
            <span className="font-semibold text-black dark:text-white">Campus Marketplace</span>
          </Link>
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <NavbarButton href="/login" variant="secondary">
              <User className="h-4 w-4 mr-1 inline" />
              Connexion
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link href="/" className="text-sm font-semibold text-black dark:text-white">
              Campus Marketplace
            </Link>
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
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
            <div className="flex w-full flex-col gap-2 pt-4">
              <NavbarButton href="/login" variant="secondary" className="w-full">
                <User className="h-4 w-4 mr-1 inline" />
                Connexion
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
