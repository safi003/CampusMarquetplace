import StarRating from "@/components/star-rating";

export default function RatingSummary({
  averageRating,
  totalReviews,
}: {
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={averageRating} />
      <span className="text-sm text-muted-foreground">({totalReviews} avis)</span>
    </div>
  );
}