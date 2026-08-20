import { z } from "zod";

export const createOrderSchema = z.object({
  productId: z.coerce.number().int().positive("Produit invalide"),
  mode: z.enum(["direct", "hand_delivery"]).default("direct"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});