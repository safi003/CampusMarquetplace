"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";

export default function NotificationsNavLink({ className = "" }: { className?: string }) {
  const { user, token } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const res = await apiFetch(`/notifications`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setUnread(data.unreadCount || 0);
      } catch {
        // ignore
      }
    }

    load();

    const socket = getSocket();
    const onNewNotification = () => {
      setUnread((n) => n + 1);
    };
    socket?.on("notification:new", onNewNotification);

    return () => {
      active = false;
      socket?.off("notification:new", onNewNotification);
    };
  }, [token, user, pathname]);

  if (!user) return null;

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className={`inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-neutral-600 transition-colors hover:bg-[#4AA3A2]/15 ${className}`}
    >
      <span className="relative">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </span>
      Notifications
    </Link>
  );
}
