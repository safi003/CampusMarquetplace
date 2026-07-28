"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogIn, UserPlus } from "lucide-react";

export default function AuthButtons() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-4 mb-6">
        <p className="text-sm text-gray-600">
          Bonjour, <span className="font-semibold text-primary">{user.name}</span>
        </p>
        <Button
          type="submit"
          className="border-1 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Deposer une annonce
        </Button>
        <Button
          variant="outline"
          onClick={logout}
          className="p-5 rounded-lg"
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/login">
        <Button variant="outline" className="p-5 rounded-lg flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Se connecter
        </Button>
      </Link>
      <Link href="/register">
        <Button className="p-5 rounded-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          S&apos;inscrire
        </Button>
      </Link>
    </div>
  );
}
