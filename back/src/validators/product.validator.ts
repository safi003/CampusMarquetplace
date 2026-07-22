import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  categoryId: z.coerce.number().int().positive("Catégorie invalide"),
});