import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, MessageCircle, Handshake } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";


async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur lors du chargement du produit");
  return res.json();
}

export default async function AchatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Choisissez votre mode d&apos;achat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {product.name} — {product.price} FCFA
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        {product.images[0] && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${product.images[0].url}`}
            alt={product.name}
            className="h-20 w-20 rounded-lg object-cover border"
          />
        )}
        <div>
          <Link href={`/products/${product.id}`} className="font-semibold  underline">
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            Vendu par{" "}
            <Link href={`/sellers/${product.seller.id}`} className="text-[#4AA3A2] hover:underline">
              {product.seller.name}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">📍 {product.address}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 opacity-60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#4AA3A2]" />
            <span className="flex-1 font-semibold">
              Paiement sécurisé
              <span className="ml-2 rounded-full bg-[#4AA3A2]/10 px-2 py-0.5 text-xs font-medium text-[#4AA3A2]">
                Recommandé
              </span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Argent protégé jusqu&apos;à confirmation de réception. Frais de
            protection : 2,5 % + 200 FCFA.
          </p>
          <Button disabled className="mt-2 w-full">
            Bientôt disponible
          </Button>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#4AA3A2]" />
            <span className="flex-1 font-semibold">Paiement direct au vendeur</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune protection plateforme. Payez directement (Wave, Orange Money,
            espèces...).
          </p>
           <Link href={`/chat/${product.seller.id}`} className="mt-2">
            <Button variant="outline" className="w-full">
              Contacter le vendeur
            </Button>
          </Link>
        </div>

        {product.handDelivery && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-[#4AA3A2]" />
              <span className="flex-1 font-semibold">Remise en main propre</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Rencontrez le vendeur et payez sur place.
            </p>
           <Link href={`/chat/${product.seller.id}`} className="mt-2">
              <Button variant="outline" className="w-full">
                Organiser la rencontre
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}