"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ReservedNotice({ productId }: { productId: number }) {
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiFetch(`/orders/product/${productId}/active`);
        const data = await res.json().catch(() => null);
        if (!mounted) return;
        setExpiresAt(data?.expiresAt ?? null);
      } catch {
        if (mounted) setExpiresAt(null);
      }
    }
    void load();
    const poll = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [productId]);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const target = new Date(expiresAt).getTime();
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      setRemaining(left);
      if (left === 0) router.refresh();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, router]);

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center text-sm font-medium text-amber-700">
      <div className="flex items-center justify-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          Réservé — disponible dans {remaining !== null ? formatCountdown(remaining) : "environ 15 min"}
        </span>
      </div>
    </div>
  );
}
