import { z } from "zod";


export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le password doit contenir au moins 6 caractères"),
  role: z.literal("student").optional().default("student"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le password est requis"),
});

