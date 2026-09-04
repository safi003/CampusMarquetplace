"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { PlusCircle } from "lucide-react";

export default function HeroCTA() {
  const { user } = useAuth();

  return (
    <Link
      href={!user ?  "/login" : !user.imageCarteScolaire || user.cardStatus === "REJECTED" || user.cardStatus === "PENDING"
        ? "/carte-scolaire"
        : "/products"}
      className="inline-flex items-center gap-2 rounded-full bg-[#4AA3A2] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#4AA3A2]/90 hover:shadow-lg hover:-translate-y-0.5"
    >
      <PlusCircle className="h-5 w-5" />
      Déposer une annonce
    </Link>
  );
}
