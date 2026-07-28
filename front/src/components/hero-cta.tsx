"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { PlusCircle } from "lucide-react";

export default function HeroCTA() {
  const { user } = useAuth();

  return (
    <Link
      href={user ? "/products" : "/login"}
      className="inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#D4A017]/90 hover:shadow-lg hover:-translate-y-0.5"
    >
      <PlusCircle className="h-5 w-5" />
      Déposer une annonce
    </Link>
  );
}
