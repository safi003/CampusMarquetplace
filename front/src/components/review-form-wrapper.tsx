"use client";

import { useRouter } from "next/navigation";
import ReviewForm from "@/components/review-form";

export default function ReviewFormWrapper({ sellerId }: { sellerId: number }) {
  const router = useRouter();

  return (
    <ReviewForm
      sellerId={sellerId}
      onReviewAdded={() => router.refresh()}
    />
  );
}
