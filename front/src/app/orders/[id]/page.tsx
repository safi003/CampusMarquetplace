"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MessageCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/app/lib/api";

interface OrderDetail {
  id: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";
  mode: "DIRECT" | "HAND_DELIVERY";
  paymentType: "SECURED" | "DIRECT";
  paymentStatus: "NONE" | "HELD" | "RELEASED" | "REFUNDED";
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  expiresAt: string | null;
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  product: { id: number; name: string; price: number; images: { id: number; url: string }[] };
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await apiFetch(`/orders/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de chargement");
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUserId(JSON.parse(stored).id);

    const interval = setInterval(fetchOrder, 15000); // resync toutes les 15s
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const remaining = useCountdown(order?.status === "ACTIVE" ? order.expiresAt : null);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await apiFetch(`/orders/${id}/confirm`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setOrder((prev) => (prev ? { ...prev, ...data } : data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Chargement...</div>;
  if (error && !order) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!order) return null;

  const isBuyer = currentUserId === order.buyer.id;
  const myConfirmation = isBuyer ? order.buyerConfirmed : order.sellerConfirmed;
  const otherConfirmation = isBuyer ? order.sellerConfirmed : order.buyerConfirmed;
  const otherName = isBuyer ? order.seller.name : order.buyer.name;

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          {order.product.images[0] && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${order.product.images[0].url}`}
              alt={order.product.name}
              className="h-16 w-16 rounded-lg object-cover border"
            />
          )}
          <div>
            <Link href={`/products/${order.product.id}`} className="font-semibold underline">
              {order.product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{order.product.price} FCFA</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          {order.paymentType === "SECURED" ? (
            <ShieldCheck className="h-4 w-4 text-[#4AA3A2]" />
          ) : (
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {order.paymentType === "SECURED" ? "Paiement sécurisé" : "Paiement direct"}
            {order.paymentType === "SECURED" && order.paymentStatus === "HELD" && (
              <span className="ml-2 text-xs text-[#4AA3A2]">(fonds bloqués — vérifié)</span>
            )}
            {order.paymentType === "SECURED" && order.paymentStatus === "NONE" && (
              <span className="ml-2 text-xs text-amber-600">(en attente de vérification staff)</span>
            )}
          </span>
        </div>

        {/* Statuts */}
        {order.status === "ACTIVE" && remaining !== null && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <Clock className="h-4 w-4" />
            {remaining > 0 ? (
              <span>Réservation active — expire dans {formatCountdown(remaining)}</span>
            ) : (
              <span>Délai dépassé, mise à jour en cours...</span>
            )}
          </div>
        )}

        {order.status === "EXPIRED" && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Cette réservation a expiré.
          </div>
        )}

        {order.status === "CANCELLED" && (
          <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Cette commande a été annulée.
          </div>
        )}

        {order.status === "COMPLETED" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Vente confirmée !
          </div>
        )}

        {/* Confirmation double */}
        {order.status === "ACTIVE" && (
          <div className="mt-5 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {myConfirmation
                ? `Vous avez confirmé. En attente de ${otherName}.`
                : `Confirmez une fois l'échange effectué avec ${otherName}.`}
            </p>
            <Button onClick={handleConfirm} disabled={myConfirmation || confirming} className="w-full">
              {myConfirmation ? "Confirmation envoyée" : "Confirmer la réception/livraison"}
            </Button>
            {otherConfirmation && !myConfirmation && (
              <p className="text-xs text-[#4AA3A2]">{otherName} a déjà confirmé de son côté.</p>
            )}
          </div>
        )}

        <Link href={`/chat/${isBuyer ? order.seller.id : order.buyer.id}`} className="mt-4 block">
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4" />
            Discuter avec {otherName}
          </Button>
        </Link>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}