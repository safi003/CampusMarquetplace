"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@/types/chat";

export default function ChatThreadPage() {
  const { userId } = useParams<{ userId: string }>();
  const otherUserId = Number(userId);
  const { user, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherName, setOtherName] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      apiFetch(`/messages/${userId}`),
      apiFetch(`/sellers/${userId}`),
    ])
      .then(async ([messagesRes, sellerRes]) => {
        const [messagesData, sellerData] = await Promise.all([
          messagesRes.json(),
          sellerRes.json(),
        ]);
        if (Array.isArray(messagesData)) setMessages(messagesData);
        if (sellerData?.name) setOtherName(sellerData.name);
        if (sellerData?.role) setOtherRole(sellerData.role);
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = (msg: Message) => {
      if (msg.receiver.id === user?.id && msg.sender.id === otherUserId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [user?.id, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setInput("");

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(
        "message:send",
        { receiverId: otherUserId, content },
        (res?: { ok: boolean; message?: Message | string }) => {
          if (res?.ok && res.message && typeof res.message !== "string") {
            setMessages((prev) => [...prev, res.message as Message]);
          }
        }
      );
    } else {
      try {
        const res = await apiFetch(`/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: otherUserId, content }),
        });
        const data = await res.json();
        if (res.ok) setMessages((prev) => [...prev, data]);
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-2xl flex-col p-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4AA3A2]/15 font-semibold text-[#4AA3A2]">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold">{otherName}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {loading && (
          <p className="text-center text-sm text-muted-foreground">Chargement...</p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] break-words rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-[#4AA3A2] text-white" : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {otherRole === "ADMIN" ? (
        <div className="border-t border-border pt-3 text-center text-sm text-muted-foreground">
          Ce fil de discussion est informatif, vous ne pouvez pas y répondre.
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-2 border-t border-border pt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            Envoyer
          </Button>
        </form>
      )}
    </div>
  );
}
