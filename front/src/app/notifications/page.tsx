"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import type { Notification } from "@/types/notification";

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeMeta: Record<string, { icon: typeof Bell; classes: string }> = {
  CARD_APPROVED: { icon: CheckCircle2, classes: "text-emerald-600" },
  CARD_REJECTED: { icon: XCircle, classes: "text-red-600" },
  ADMIN_MESSAGE: { icon: ShieldCheck, classes: "text-[#4AA3A2]" },
};

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      void load();
    } else {
      setLoading(false);
    }
  }, [user, token, load]);

  async function markAllRead() {
    await apiFetch(`/notifications/read-all`, { method: "POST" });
    await load();
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Connectez-vous pour voir vos notifications.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="h-6 w-6 text-[#4AA3A2]" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">{unreadCount} non lue(s)</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Chargement...</p>
      ) : notifications.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Aucune notification pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] || { icon: Bell, classes: "text-muted-foreground" };
            const Icon = meta.icon;
            const body = (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  n.isRead
                    ? "border-border bg-card"
                    : "border-[#4AA3A2]/30 bg-[#4AA3A2]/5 hover:bg-[#4AA3A2]/10"
                }`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.classes}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.isRead ? "text-muted-foreground" : "font-medium"}`}>
                    {n.content}
                  </p>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                {!n.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#4AA3A2]" />
                )}
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} onClick={markAllRead} className="block">
                {body}
              </Link>
            ) : (
              body
            );
          })}
        </div>
      )}
    </div>
  );
}
