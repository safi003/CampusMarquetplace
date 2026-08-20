"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function BuyButton({ productId }: { productId: number }) {
  const router = useRouter();
  const { user } = useAuth();

  function handleClick() {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/products/${productId}/achat`)}`
      );
      return;
    }
    router.push(`/products/${productId}/achat`);
  }

  return (
    <Button size="lg" className="w-full" onClick={handleClick}>
      <ShoppingCart />
      Acheter
    </Button>
  );
}