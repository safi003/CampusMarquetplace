export default function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starClass = size === "lg" ? "text-2xl" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 ${starClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? "text-[#D4A017]" : "text-gray-300"}>
          &#9733;
        </span>
      ))}
    </span>
  );
}
