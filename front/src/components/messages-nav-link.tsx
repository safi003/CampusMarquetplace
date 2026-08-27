"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";
import { Conversation } from "@/types/chat";

export default function MessagesNavLink({
  className = "",
}: {
  className?: string;
}) {
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
        const res = await apiFetch(`/messages/conversations`);
        if (!res.ok) return;
        const conversations = (await res.json()) as Conversation[];
        if (!active) return;
        const total = Array.isArray(conversations)
          ? conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
          : 0;
        setUnread(total);
      } catch {
        // ignore
      }
    }

    load();

    const socket = getSocket();
    if (socket) socket.on("message:new", load);

    return () => {
      active = false;
      socket?.off("message:new", load);
    };
  }, [token, user, pathname]);

  if (!user) return null;

  return (
    <Link
      href="/chat"
      aria-label="Messages"
      className={`inline-flex flex-col items-center gap-0.5 rounded-lg text-sm font-medium text-neutral-600 transition-colors hover:bg-[#4AA3A2]/15 ${className}`}
    >
      <span className="relative">
        <MessageCircle className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </span>
      <span>Messages</span>
    </Link>
  );
}
