import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#D4A017] mb-3">Campus Marketplace</h3>
            <p className="text-sm text-muted-foreground">
              Achetez et vendez entre étudiants sur votre campus.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-[#D4A017] transition-colors">Accueil</Link></li>
              <li><Link href="/products" className="hover:text-[#D4A017] transition-colors">Vendre</Link></li>
              <li><Link href="/login" className="hover:text-[#D4A017] transition-colors">Connexion</Link></li>
              <li><Link href="/register" className="hover:text-[#D4A017] transition-colors">Inscription</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Catégories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-[#D4A017] transition-colors cursor-pointer">Cours & Révisions</span></li>
              <li><span className="hover:text-[#D4A017] transition-colors cursor-pointer">Électronique</span></li>
              <li><span className="hover:text-[#D4A017] transition-colors cursor-pointer">Mode & Accessoires</span></li>
              <li><span className="hover:text-[#D4A017] transition-colors cursor-pointer">Services</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@campusmarketplace.com</li>
              <li>Dakar, Sénégal</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Campus Marketplace. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
