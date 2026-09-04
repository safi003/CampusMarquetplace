"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MessageCircle, Handshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/app/lib/api";

interface AchatOptionsProps {
  productId: number;
  sellerId: number;
  handDelivery: boolean;
}

export default function AchatOptions({
  productId,
  sellerId,
  handDelivery,
}: AchatOptionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createOrder(paymentType: "SECURED" | "DIRECT", mode: "DIRECT" | "HAND_DELIVERY") {
    setLoading(paymentType + mode);
    setError(null);
    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, paymentType, mode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de réserver ce produit");
      }

      router.push(`/orders/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {/* Paiement sécurisé */}
      <div className="flex flex-col gap-2 rounded-xl border-2 border-[#4AA3A2] bg-[#4AA3A2]/5 p-5">
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
        <Button
          className="mt-2 w-full"
          disabled={loading !== null}
          onClick={() => createOrder("SECURED", "DIRECT")}
        >
          {loading === "SECUREDDIRECT" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Réserver avec paiement sécurisé"
          )}
        </Button>
      </div>

      {/* Paiement direct au vendeur */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#4AA3A2]" />
          <span className="flex-1 font-semibold">Paiement direct au vendeur</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Aucune protection plateforme. Payez directement (Wave, Orange Money,
          espèces...).
        </p>
        <Button
          variant="outline"
          className="mt-2 w-full"
          disabled={loading !== null}
          onClick={() => createOrder("DIRECT", "DIRECT")}
        >
          {loading === "DIRECTDIRECT" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Réserver et contacter le vendeur"
          )}
        </Button>
      </div>

      {/* Remise en main propre */}
      {handDelivery && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-[#4AA3A2]" />
            <span className="flex-1 font-semibold">Remise en main propre</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Rencontrez le vendeur et payez sur place.
          </p>
          <Button
            variant="outline"
            className="mt-2 w-full"
            disabled={loading !== null}
            onClick={() => createOrder("DIRECT", "HAND_DELIVERY")}
          >
            {loading === "DIRECTHAND_DELIVERY" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Réserver et organiser la rencontre"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}