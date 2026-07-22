import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { registerSchema, loginSchema } from "../validators/auth.validator";



export async function register(req: Request, res: Response) {
  try {
    // 1. Validation des champs texte avec zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { name, email, password, role } = parsed.data;

    // 2. Vérifie que le fichier a bien été envoyé
    if (!req.file) {
      return res.status(400).json({ message: "La carte scolaire est obligatoire" });
    }

    // 3. Vérifie que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // 4. Hash du password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Création en base via Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase() as "STUDENT" | "ADMIN", // aligné avec l'enum Prisma
        imageCarteScolaire: req.file.path,
      },
    });

    // 6. Ne jamais renvoyer le password, même hashé
    const { password: _, ...publicUser } = user;

    return res.status(201).json(publicUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
export async function login(req: Request, res: Response) {
  try {
    // 1. Validation avec zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { email, password } = parsed.data;

    // 2. Recherche de l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email ou password incorrect" });
    }

    // 3. Comparaison du password avec le hash stocké
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou password incorrect" });
    }

    // 4. Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 5. Réponse sans le password
    const { password: _, ...publicUser } = user;

    return res.status(200).json({ user: publicUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}


export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  const { password: _, ...publicUser } = user;
  return res.status(200).json(publicUser);
}