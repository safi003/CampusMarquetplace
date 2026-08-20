"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";
import { Conversation } from "@/types/chat";

export default function ChatPage() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) return;
      const res = await apiFetch(`/messages/conversations`);
      if (res.ok && active) {
        setConversations(await res.json());
      }
      if (active) setLoading(false);
    }

    load();

    const socket = getSocket();
    if (socket) socket.on("message:new", load);

    return () => {
      active = false;
      socket?.off("message:new", load);
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="mt-4 flex flex-col gap-2">
        {loading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {!loading && conversations.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune conversation pour le moment.
          </p>
        )}
        {conversations.map((conv) => (
          <Link
            key={conv.otherUser.id}
            href={`/chat/${conv.otherUser.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4AA3A2]/15 font-semibold text-[#4AA3A2]">
              {conv.otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{conv.otherUser.name}</span>
                {conv.unreadCount > 0 && (
                  <span className="rounded-full bg-[#4AA3A2] px-2 py-0.5 text-xs font-medium text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {conv.lastMessage.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}