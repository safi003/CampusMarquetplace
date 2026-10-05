"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PackageSearch,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";

interface Order {
  id: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";
  mode: "DIRECT" | "HAND_DELIVERY";
  paymentType: "SECURED" | "DIRECT";
  paymentStatus: "NONE" | "HELD" | "RELEASED" | "REFUNDED";
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  createdAt: string;
  expiresAt: string | null;
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  product: {
    id: number;
    name: string;
    price: number;
    status: string;
    images: { id: number; url: string }[];
  };
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string; bg: string }
> = {
  ACTIVE: {
    label: "En cours",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  PENDING: {
    label: "En attente",
    icon: AlertCircle,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  COMPLETED: {
    label: "Terminé",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  EXPIRED: {
    label: "Expiré",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  CANCELLED: {
    label: "Annulé",
    icon: XCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCard({
  order,
  role,
}: {
  order: Order;
  role: "buyer" | "seller";
}) {
  const cfg = statusConfig[order.status] ?? statusConfig.CANCELLED;
  const StatusIcon = cfg.icon;
  const other = role === "buyer" ? order.seller : order.buyer;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[#4AA3A2]/30"
    >
      {order.product.images[0] ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${order.product.images[0].url}`}
          alt={order.product.name}
          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover border"
        />
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
          <PackageSearch className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{order.product.name}</h3>
        <p className="text-sm font-bold text-[#4AA3A2]">
          {order.product.price} FCFA
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {role === "buyer"
            ? `Vendeur : ${other.name}`
            : `Acheteur : ${other.name}`}
          <span className="mx-1.5">&middot;</span>
          {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
        >
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </span>
        {order.paymentType === "SECURED" && (
          <span className="text-[10px] text-muted-foreground">
            Paiement sécu
          </span>
        )}
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUserId(JSON.parse(stored).id);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await apiFetch("/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur de chargement");
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const buyerOrders = orders.filter((o) => o.buyer.id === currentUserId);
  const sellerOrders = orders.filter((o) => o.seller.id === currentUserId);
  const activeTab = tab === "buyer" ? buyerOrders : sellerOrders;

  const activeCount = buyerOrders.filter((o) => o.status === "ACTIVE").length;
  const pendingCount = sellerOrders.filter((o) => o.status === "PENDING").length;

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Chargement de vos commandes...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>

      <div className="flex gap-1 border-b border-border mb-6">
        <button
          onClick={() => setTab("buyer")}
          className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "buyer"
              ? "bg-card border border-border border-b-white text-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Mes achats ({buyerOrders.length})
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("seller")}
          className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "seller"
              ? "bg-card border border-border border-b-white text-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Store className="h-4 w-4" />
          Mes ventes ({sellerOrders.length})
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {activeTab.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <PackageSearch className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {tab === "buyer"
              ? "Vous n'avez pas encore fait d'achat."
              : "Vous n'avez pas encore de réservation sur vos annonces."}
          </p>
          {tab === "buyer" && (
          <Link href="/" className="mt-2 text-sm text-[#4AA3A2] underline underline-offset-2 hover:text-[#2F7372]">
            Parcourir les annonces
          </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTab.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              role={tab === "buyer" ? "buyer" : "seller"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
