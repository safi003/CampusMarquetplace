import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="text-2xl font-bold text-foreground">Produit introuvable</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ce produit n&apos;existe plus ou n&apos;a jamais existé. Il a peut-être été
        supprimé ou vendu.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Voir tous les produits
      </Link>
    </div>
  );
}
