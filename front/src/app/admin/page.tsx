"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarRating from "@/components/star-rating";
import { ShieldCheck } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  imageCarteScolaire: string | null;
  cardStatus: "PENDING" | "APPROVED" | "REJECTED";
  cardRejectionReason: string | null;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
  totalProducts: number;
}

const statusLabels: Record<AdminUser["cardStatus"], string> = {
  APPROVED: "Validé",
  PENDING: "En attente",
  REJECTED: "Refusé",
};

function StatusBadge({ status }: { status: AdminUser["cardStatus"] }) {
  const styles =
    status === "APPROVED"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
      : status === "REJECTED"
        ? "bg-red-500/10 text-red-700 border-red-500/30"
        : "bg-[#D4A017]/10 text-[#B8860B] border-[#D4A017]/30";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {statusLabels[status]}
    </span>
  );
}

function CardImageThumb({ user }: { user: AdminUser }) {
  const url = user.imageCarteScolaire
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${user.imageCarteScolaire}`
    : null;
  if (!url) {
    return <span className="text-xs text-muted-foreground">Aucune carte</span>;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" title="Voir la pièce d'identité">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Carte d'identité de ${user.name}`}
        className="h-12 w-12 rounded-md border border-border object-cover transition hover:scale-105"
      />
    </a>
  );
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement");
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "ADMIN" && token) {
      void (async () => {
        await loadUsers();
      })();
    }
  }, [user, token, loadUsers]);

  async function decide(id: number, decision: "approve" | "reject", reason?: string) {
    setBusy(true);
    setError("");
    try {
      const body = decision === "reject" ? { reason } : undefined;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}/${decision}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || (data.errors ? Object.values(data.errors).flat().join(", ") : "Erreur serveur")
        );
      }
      setActionUser(null);
      setRejectReason("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setBusy(false);
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Accès réservé aux administrateurs</h1>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16 text-muted-foreground">Chargement...</div>;
  }

  const pendingCount = users.filter((u) => u.cardStatus === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-sm text-muted-foreground">
          Utilisateurs classés par nombre d&apos;étoiles. {pendingCount} carte(s) en attente de vérification.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {users.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">Aucun utilisateur.</div>
        )}

        {users.map((u, index) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="flex w-8 items-center justify-center text-sm font-semibold text-muted-foreground">
              {index + 1}
            </div>

            <CardImageThumb user={u} />

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{u.name}</span>
                <StatusBadge status={u.cardStatus} />
                {u.role === "ADMIN" && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    Admin
                  </span>
                )}
              </div>
              <span className="truncate text-sm text-muted-foreground">{u.email}</span>
              {u.cardStatus === "REJECTED" && u.cardRejectionReason && (
                <span className="mt-1 text-xs text-red-600">Motif du refus : {u.cardRejectionReason}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <StarRating rating={u.averageRating} size="sm" />
              <span className="font-semibold">{u.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({u.totalReviews} avis)</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{u.totalProducts} annonce(s)</span>
              {u.imageCarteScolaire && u.cardStatus !== "APPROVED" && (
                <div className="flex gap-2">
                  {u.cardStatus === "PENDING" && (
                    <>
                      <Button size="sm" onClick={() => decide(u.id, "approve")} disabled={busy}>
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setActionUser(u);
                          setRejectReason("");
                        }}
                        disabled={busy}
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                  {u.cardStatus === "REJECTED" && (
                    <Button size="sm" onClick={() => decide(u.id, "approve")} disabled={busy}>
                      Revalider
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Refuser la carte de {actionUser.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              L&apos;utilisateur sera notifié du motif du refus.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="reason">Motif du refus</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex : photo illisible, document expiré..."
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setActionUser(null)} disabled={busy}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => decide(actionUser.id, "reject", rejectReason)}
                disabled={busy || rejectReason.trim().length < 3}
              >
                {busy ? "Envoi..." : "Confirmer le refus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
