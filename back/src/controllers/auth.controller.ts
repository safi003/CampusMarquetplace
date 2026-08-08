import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { uploadFile, generateKey } from "../lib/storage";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



export async function register(req: Request, res: Response) {
  try {
    // 1. Validation des champs texte avec zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { name, email, password, role } = parsed.data;

    // 2. Vérifie que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // 3. Hash du password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Upload de la pièce d'identité vers RustFS (optionnel : différé après inscription)
    let carteKey: string | null = null;
    if (req.file) {
      const key = generateKey("uploads/cartes-scolaires", req.file.originalname);
      carteKey = await uploadFile(req.file.buffer, key, req.file.mimetype);
    }

    // 5. Création en base via Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase() as "STUDENT" | "ADMIN", // aligné avec l'enum Prisma
        ...(carteKey ? { imageCarteScolaire: carteKey } : {}),
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
    if (!user || !user.password) {
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
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    // 5. Réponse sans le password
    const { password: _, ...publicUser } = user;

    return res.status(200).json({ user: publicUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}


export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Token Google manquant" });
    }

    // 1. Vérification du jeton ID Google (signature + audience)
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({ message: "Token Google invalide" });
    }
    if (!payload?.email) {
      return res.status(401).json({ message: "Token Google invalide" });
    }

    // 2. Cherche l'utilisateur par googleId ou par email
    let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: payload.email } });
    }

    // 3. Création si inconnu (sans mot de passe ni pièce d'identité : upload différé)
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          googleId: payload.sub,
        },
      });
    } else if (!user.googleId) {
      // 4. Compte existant via email/password : on rattache le compte Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub },
      });
    }

    // 5. Génération du token JWT habituel
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

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

export async function uploadCarteScolaire(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const key = generateKey("uploads/cartes-scolaires", req.file.originalname);
    const carteKey = await uploadFile(req.file.buffer, key, req.file.mimetype);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { imageCarteScolaire: carteKey },
    });

    const { password: _, ...publicUser } = user;
    return res.status(200).json(publicUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}