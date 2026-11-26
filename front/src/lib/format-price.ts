const CURRENCY_SYMBOLS: Record<string, string> = {
  FCFA: "FCFA",
  FG: "FG",
  GNF: "FG",
  EUR: "€",
  USD: "$",
};

export function formatPrice(
  amount: number | string | null | undefined,
  currency = "FCFA",
): string {
  if (amount == null) return "";
  const value = Number(amount);
  if (Number.isNaN(value)) return "";
  return `${value.toLocaleString()} ${CURRENCY_SYMBOLS[currency] || currency}`;
}

export const CURRENCIES = [
  { value: "FCFA", label: "FCFA" },
  { value: "FG", label: "FG (Franc Guinéen)" },
];
