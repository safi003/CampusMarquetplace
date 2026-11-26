"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";

interface OrderBadge {
  id: number;
  status: "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";
  buyer: { id: number };
  seller: { id: number };
}

export default function OrdersNavLink({
  className = "",
}: {
  className?: string;
}) {
  const { user, token } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token || !user) return;

    let active = true;
    const userId = user.id;

    async function load() {
      try {
        const res = await apiFetch("/orders");
        if (!res.ok) return;

        const orders = (await res.json()) as OrderBadge[];
        if (!active) return;

        const total = Array.isArray(orders)
          ? orders.filter(
              (o) =>
                (o.buyer.id === userId && o.status === "ACTIVE") ||
                (o.seller.id === userId &&
                  o.status === "ACTIVE"),
            ).length
          : 0;

        setCount(total);
      } catch {
        setCount(0);
      }
    }

    load();

    const socket = getSocket();
    socket?.on("notification:new", load);

    return () => {
      active = false;
      socket?.off("notification:new", load);
    };
  }, [token, user, pathname]);

  if (!user) return null;

  return (
    <Link
      href="/orders"
      aria-label="Commandes"
      className={`inline-flex flex-col items-center gap-0.5 rounded-lg text-sm font-medium text-neutral-600 transition-colors hover:bg-[#4AA3A2]/15 ${className}`}
    >
      <span className="relative">
        <ShoppingBag className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span>Commandes</span>
    </Link>
  );
}
