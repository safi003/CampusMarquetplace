"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { resetSocket, getSocket } from "@/lib/socket";
import { apiFetch } from "@/app/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  imageCarteScolaire: string | null;
  cardStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  cardRejectionReason: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await apiFetch(`/auth/me`);
      if (!res.ok) return;
      const fresh = await res.json();
      localStorage.setItem("user", JSON.stringify(fresh));
      setUser(fresh);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    // Corrige une copie locale potentiellement périmée à chaque chargement
    /* eslint-disable react-hooks/set-state-in-effect */
    void refreshUser();
    /* eslint-enable react-hooks/set-state-in-effect */

    // Mise à jour instantanée quand l'admin valide/refuse la carte
    const socket = getSocket();
    const onNotification = (notification: { type?: string }) => {
      if (notification?.type === "CARD_APPROVED" || notification?.type === "CARD_REJECTED") {
        void refreshUser();
      }
    };
    socket?.on("notification:new", onNotification);

    return () => {
      socket?.off("notification:new", onNotification);
    };
  }, [token, refreshUser]);

  function login(user: User, token: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    resetSocket();
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
