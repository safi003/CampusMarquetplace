import { z } from "zod";

export const createOrderSchema = z.object({
  productId: z.coerce.number().int().positive("Produit invalide"),
  mode: z.enum(["DIRECT", "HAND_DELIVERY"]).default("DIRECT"),
  paymentType: z.enum(["SECURED", "DIRECT"]).default("SECURED"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"]),
});