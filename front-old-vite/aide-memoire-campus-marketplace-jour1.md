# Aide-mémoire — Campus Marketplace (Jour 1)

## Stack du projet
React.js, Next.js, Node.js, Express.js, PostgreSQL, Prisma ORM, TypeScript, Socket.io, Tailwind CSS, JWT, REST APIs.

## Roadmap globale d'apprentissage
1. **TypeScript** (fondations) ✅ vu aujourd'hui
2. **Backend** : Node/Express + Prisma + PostgreSQL (Neon) — 🔄 en cours
3. **Authentification JWT** (access + refresh token, cookies httpOnly)
4. **Next.js** (Server vs Client Components, routing par dossiers)
5. **Socket.io** (messagerie temps réel)
6. **Fonctionnalités avancées** (recherche, wishlists, reviews, notifications)
7. **Dashboard admin**

---

## 1. TypeScript — concepts vus aujourd'hui

### Types de base
```typescript
let name: string = "Safiatou";
let age: number = 25;
let tags: string[] = ["electronics"];
```

### `interface` — structure d'une entité
```typescript
interface Product {
  id: number;
  title: string;
  description?: string; // ? = optionnel
}
```

### Union types — remplace les `choices` Django
```typescript
type UserRole = "student" | "admin";
```

### `enum` — équivalent natif utilisé par Prisma
```typescript
enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
}
```
👉 Quand un `enum` est déclaré dans `schema.prisma`, Prisma Client le génère automatiquement en TypeScript — pas besoin de le redéfinir à la main côté backend.

### Utility types essentiels (très utilisés avec Prisma)
```typescript
Partial<User>   // tous les champs deviennent optionnels (utile pour un update)
Omit<User, "password">  // exclut un champ (ex: ne jamais exposer le password)
Pick<User, "email" | "password">  // ne garde que certains champs (ex: login)
Required<ProductDraft>  // force tous les champs optionnels à devenir obligatoires
Readonly<Config>  // empêche la modification après création
Record<string, number>  // objet à clés dynamiques typées
```

### Génériques (lecture, pas besoin d'écrire pour l'instant)
```typescript
async function fetchProduct(id: number): Promise<Product> { ... }
```

### Type guard (pattern pour les permissions par rôle)
```typescript
function isAdmin(user: PublicUser): boolean {
  return user.role === "admin";
}
```

---

## 2. Interfaces finales du projet (fichier `entities.ts`)

```typescript
export type UserRole = "student" | "admin";

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  password: string;
  imageCarteScolaire: string; // obligatoire — vérification anti-arnaque
}

export type PublicUser = Omit<User, "password">;

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  sellerId: number;
  categoryId: number;
  isSold: boolean;
  createdAt: Date;
}

export interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
  isRead: boolean;
}
```

**Décisions prises :**
- Pas de `verificationStatus` pour l'instant (gardé simple, ajoutable plus tard)
- Carte scolaire obligatoire dès l'inscription → nécessitera un upload de fichier (multer) côté register, pas juste des champs texte

---

## 3. Schéma Prisma (`schema.prisma`)

Points clés à retenir :
- **Relations bidirectionnelles obligatoires** : contrairement à Django, il faut déclarer le champ scalaire (`sellerId Int`) + la relation (`seller User @relation(...)`) + le tableau reverse côté modèle parent (`products Product[]`)
- **Relations multiples vers le même modèle** (cas `Message` avec sender/receiver) → nécessite un nom explicite : `@relation("SentMessages")` / `@relation("ReceivedMessages")`, équivalent du `related_name` Django
- `Float` utilisé pour `price` (à surveiller : `Decimal` serait plus sûr en prod pour éviter les problèmes d'arrondi sur de l'argent)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  STUDENT
  ADMIN
}

model User {
  id                 Int      @id @default(autoincrement())
  name               String
  role               UserRole @default(STUDENT)
  email              String   @unique
  password           String
  imageCarteScolaire String
  createdAt          DateTime @default(now())

  products         Product[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

model Category {
  id   Int    @id @default(autoincrement())
  name String
  slug String @unique

  products Product[]
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float
  image       String?
  isSold      Boolean  @default(false)
  createdAt   DateTime @default(now())

  seller     User     @relation(fields: [sellerId], references: [id])
  sellerId   Int
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
}

model Message {
  id        Int      @id @default(autoincrement())
  content   String
  timestamp DateTime @default(now())
  isRead    Boolean  @default(false)

  sender     User @relation("SentMessages", fields: [senderId], references: [id])
  senderId   Int
  receiver   User @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId Int
}
```

### Commandes Prisma essentielles
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
npx prisma init                      # setup initial
npx prisma migrate dev --name init   # crée les tables + génère le client
npx prisma studio                    # interface graphique (localhost:5555)
```

---

## 4. ⚠️ À FAIRE EN PRIORITÉ DEMAIN — Réorganisation du projet

**Problème identifié :** tout le code (Prisma, futur Express) est actuellement dans `front/`, mélangé avec Next.js/React.

**Structure cible :**
```
CampusMarketplace/
  front/     ← Next.js, React, Tailwind
  back/      ← Node, Express, Prisma, Socket.io
```

**Checklist de migration :**
- [ ] Créer `back/` à la racine, `npm init -y` dedans
- [ ] Déplacer `prisma/`, `.env` (avec `DATABASE_URL`), `test.ts` de `front/` vers `back/`
- [ ] Dans `back/` : installer `prisma`, `@prisma/client`, `express`, `cors`, `dotenv`, `typescript`, `ts-node`, `@types/node`, `@types/express`, `tsx`
- [ ] Dans `front/` : désinstaller `prisma` et `@prisma/client` si présents (`npm uninstall prisma @prisma/client`)
- [ ] Relancer `npx prisma migrate dev --name init` depuis `back/`
- [ ] Retester avec `npx tsx test.ts` depuis `back/`

**Pourquoi c'est important :** le frontend ne doit jamais avoir accès direct à Prisma ni au `.env` de la base de données (risque d'exposer les credentials côté client). Le frontend communique avec le backend uniquement via des appels API (fetch/axios).

**Erreur rencontrée aujourd'hui (`ECONNREFUSED`) — points à vérifier si ça persiste après réorganisation :**
- URL Neon correcte dans `.env` avec `sslmode=require`
- Utiliser l'URL **directe** (sans `-pooler`) pour `prisma migrate dev`
- Vérifier que le projet Neon n'est pas en pause (dashboard → statut "Active")

---

## Pour reprendre demain
1. Faire la réorganisation `front/` / `back/` ci-dessus
2. Relancer la migration Prisma et confirmer que `test.ts` fonctionne
3. Puis : premiers controllers Express (register/login) + JWT
