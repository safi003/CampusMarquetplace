import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { uploadFile, generateKey } from "../lib/storage";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import axios from "axios";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



export async function register(req: Request, res: Response) {
  try {
    // 1. Validation des champs texte avec zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { name, email, password } = parsed.data;

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
        role: "USER",
        ...(carteKey
          ? { imageCarteScolaire: carteKey, cardStatus: "PENDING" as const }
          : {}),
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


function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(codeVerifier: string): string {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}
// auth google with JWT
export function googleLogin(req: Request, res: Response) {
  const state = crypto.randomBytes(32).toString("hex");

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Stocker côté serveur dans la session
  req.session.googleOAuthState = state;
  req.session.googleCodeVerifier = codeVerifier;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    response_type: "code",

    scope: "openid email profile",

    // CSRF
    state,

    // PKCE
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.redirect(googleAuthUrl);
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Code Google manquant",
      });
    }

    if (!state || typeof state !== "string") {
      return res.status(400).json({
        message: "State Google manquant",
      });
    }

    // Récupérer les valeurs stockées dans la session
    const storedState = req.session.googleOAuthState;
    const codeVerifier = req.session.googleCodeVerifier;

    // Vérification CSRF
    if (!storedState || state !== storedState) {
      return res.status(403).json({
        message: "State OAuth Google invalide",
      });
    }

    // Vérification PKCE
    if (!codeVerifier) {
      return res.status(400).json({
        message: "Code verifier PKCE Google manquant",
      });
    }

    // Supprimer les valeurs après utilisation
    delete req.session.googleOAuthState;
    delete req.session.googleCodeVerifier;

    // Échanger le code contre les tokens Google.
    // PKCE : le client_secret est optionnel grâce au code_verifier.
    const tokenPayload: Record<string, string> = {
      client_id: process.env.GOOGLE_CLIENT_ID!,

      code,

      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,

      grant_type: "authorization_code",

      // PKCE
      code_verifier: codeVerifier,
    };

    if (process.env.GOOGLE_CLIENT_SECRET) {
      tokenPayload.client_secret = process.env.GOOGLE_CLIENT_SECRET;
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      tokenPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const {
      id_token: idToken,
      access_token: googleAccessToken,
    } = tokenResponse.data;

    if (!idToken) {
      return res.status(401).json({
        message: "Impossible d'obtenir le token Google",
      });
    }

    // Vérifier le ID token Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return res.status(401).json({
        message: "Token Google invalide",
      });
    }

    const email = payload.email;

    // Chercher par googleId
    let user = await prisma.user.findUnique({
      where: {
        googleId: payload.sub,
      },
    });

    // Sinon chercher par email
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    // Créer le compte
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name || email.split("@")[0],
          email,
          googleId: payload.sub,
          role: "USER",
        },
      });
    }

    // Rattacher Google à un compte existant
    else if (!user.googleId) {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleId: payload.sub,
        },
      });
    }

    // Ton JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      } as jwt.SignOptions
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/google?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.error("Erreur Google OAuth :", error);

    return res.status(500).json({
      message: "Erreur lors de l'authentification Google",
    });
  }
}


// auth github with PKCE and CSRF protection(state)
export function githubLogin(req: Request, res: Response) {
  const state = crypto.randomBytes(32).toString("hex");

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Stockage côté serveur
  req.session.githubOAuthState = state;
  req.session.githubCodeVerifier = codeVerifier;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_CALLBACK_URL!,
    scope: "read:user user:email",

    // CSRF
    state,

    // PKCE
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.redirect(githubAuthUrl);
}

export async function githubCallback(req: Request, res: Response) {
  try {
    // 1. Récupérer le code et le state envoyé par GitHub
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Code GitHub manquant",
      });
    }
    if (!state || typeof state !== "string") {
      return res.status(400).json({
        message: "State GitHub manquant",
      });
    }
    const storedState = req.session.githubOAuthState;
    const codeVerifier = req.session.githubCodeVerifier;


    if (!storedState || state !== storedState) {
      return res.status(403).json({
        message: "State OAuth invalide",
      });
    }
    
    if (!codeVerifier) {
      return res.status(400).json({
        message: "Code verifier PKCE manquant",
     });
    }

    delete req.session.githubOAuthState;
    delete req.session.githubCodeVerifier;


    // 2. Échanger le code GitHub contre un access token
    const tokenResponse = await axios.post(
       "https://github.com/login/oauth/access_token",
       {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,

        // PKCE
        code_verifier: codeVerifier,
     },
     {
      headers: {
        Accept: "application/json",
      },
    }
   );

    const githubAccessToken = tokenResponse.data.access_token;

    if (!githubAccessToken) {
      console.error("Réponse GitHub :", tokenResponse.data);

      return res.status(401).json({
        message: "Impossible d'obtenir le token GitHub",
      });
    }

    // 3. Récupérer les informations du profil GitHub
    const githubUserResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const githubUser = githubUserResponse.data;

    // 4. Récupérer les emails GitHub
    const emailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const emails = emailsResponse.data;

    const primaryEmail = emails.find(
      (email: any) => email.primary && email.verified
    );

    if (!primaryEmail?.email) {
      return res.status(400).json({
        message: "Aucun email vérifié trouvé sur GitHub",
      });
    }

    const email = primaryEmail.email;

    // 5. Chercher l'utilisateur par githubId
    let user = await prisma.user.findUnique({
      where: {
        githubId: String(githubUser.id),
      },
    });

    // 6. Si githubId inconnu, chercher par email
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    // 7. Créer le compte si l'utilisateur n'existe pas
    if (!user) {
      user = await prisma.user.create({
        data: {
          name:
            githubUser.name ||
            githubUser.login ||
            email.split("@")[0],
          email,
          githubId: String(githubUser.id),
          role: "USER",
        },
      });
    }
    // 8. Compte existant : rattacher GitHub
    else if (!user.githubId) {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          githubId: String(githubUser.id),
        },
      });
    }

    // 9. Générer TON JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      } as jwt.SignOptions
    );

    // 10. Retirer le password de la réponse
    const { password: _, ...publicUser } = user;

    return res.redirect(`${process.env.FRONTEND_URL}/auth/github?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("Erreur GitHub OAuth :", error);

    return res.status(500).json({
      message: "Erreur lors de l'authentification GitHub",
    });
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
      data: {
        imageCarteScolaire: carteKey,
        cardStatus: "PENDING",
        cardRejectionReason: null,
      },
    });

    const { password: _, ...publicUser } = user;
    return res.status(200).json(publicUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}