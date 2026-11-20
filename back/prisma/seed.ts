import "dotenv/config";
import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma";
import { uploadFile } from "../src/lib/storage";

// ---------------------------------------------------------------------------
// Photos disponibles dans front/public (monté dans le conteneur backend en production)
// ---------------------------------------------------------------------------

const SEED_ASSET_DIR =
  process.env.SEED_ASSET_DIR ||
  path.resolve(__dirname, "..", "..", "front", "public");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function readSeedImage(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const mimetype = MIME_BY_EXT[ext];
  if (!mimetype) {
    throw new Error(`Format d'image non pris en charge pour ${fileName}`);
  }

  return {
    buffer: fs.readFileSync(path.join(SEED_ASSET_DIR, fileName)),
    mimetype,
    ext,
  };
}

// ---------------------------------------------------------------------------
// Données de seed
// ---------------------------------------------------------------------------

const SEED_USERS = [
  "Awa Diallo",
  "Lucas Martin",
  "Emma Dubois",
  "Yacine Bensalem",
  "Chloé Petit",
  "Noah Bernard",
  "Inès Moreau",
  "Adam Lambert",
  "Léa Girard",
  "Rayan N'Diaye",
  "Manon Leroy",
  "Hugo Faure",
];

const CAMPUSES = [
  "Résidence A - Campus de Cergy",
  "Résidence B - Campus de Bastia",
  "Chambre 112 - Campus de Nanterre",
  "Studios - Campus de Villetaneuse",
];

interface SeedProduct {
  name: string;
  price: number;
  categorySlug: string;
  description: string;
  imageFiles?: string[];
}

const SEED_PRODUCTS: SeedProduct[] = [
  // Informatique
  { name: "Clavier mécanique", price: 35, categorySlug: "informatique", description: "Switchs rouges, rétroéclairage RGB, très agréable pour coder.", imageFiles: ["clavier.jpg"] },
  { name: "Souris gaming", price: 15, categorySlug: "informatique", description: "Souris 6 boutons, capteur 8000 dpi, légèrement usée mais parfaite.", imageFiles: ["souris.jpg","souris1.jpg"]},
  { name: "Ordinateur Lenovo d'occasion", price: 180, categorySlug: "informatique", description: "Ordinateur portable Lenovo utilisé pour les cours. Fonctionne correctement, avec des marques d'usage.", imageFiles: ["pc1.jpg"] },
  { name: "Ordinateur portable gris d'occasion", price: 260, categorySlug: "informatique", description: "Ordinateur portable d'occasion en bon état de fonctionnement. Quelques traces d'usure visibles, vendu avec son chargeur.", imageFiles: ["pc2.jpg"] },
  
  // Livres
  { name: "Lot de livres jeunesse d'occasion", price: 10, categorySlug: "livres", description: "Lot d'albums pour enfants déjà lus. Pages propres et quelques traces d'usage sur les couvertures. Je les vends car ils ne sont plus utilisés.", imageFiles: ["livrej4.PNG", "lvrej1.PNG", "lvrej2.PNG"] },
  { name: "La Citadelle du musulman", price: 6, categorySlug: "livres", description: "Livre de prières en français et en arabe, déjà utilisé et en bon état. Quelques marques sur la couverture.", imageFiles: ["cita.jpg"] },
  { name: "Les Invocations Exaucées", price: 7, categorySlug: "livres", description: "Livre d'occasion en français et en arabe, bien conservé avec de légères traces d'usage.", imageFiles: ["inv.jpg"] },
  { name: "Leçons de Tawhid", price: 8, categorySlug: "livres", description: "Livre d'occasion en bon état, avec de légères marques sur la couverture.", imageFiles: ["taw.jpg"] },
  { name: "Dictionnaire anglais-français", price: 8, categorySlug: "livres", description: "800 pages, idéal pour la préparation du TOEIC." , imageFiles: ["AF1.jpg", "AF2.jpg"]},
  
  
  // Vélos
  { name: "Vélo de ville d'occasion", price: 90, categorySlug: "velos", description: "Vélo 7 vitesses déjà utilisé, révisé et en bon état. Quelques traces d'usure normales. Je le vends car je ne l'utilise plus.", imageFiles: ["velo.PNG", "vello1.PNG"] },
  { name: "Casque vélo", price: 15, categorySlug: "velos", description: "Taille M, aérations, léger.", imageFiles: ["velloo.PNG", "velloo1.PNG"] },
  { name: "Antivol U", price: 10, categorySlug: "velos", description: "Antivol en U avec clés, très robuste.",imageFiles: ["v1.jpg", "vv1.jpg"]  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Seed CampusMarketplace ===\n");

  // 1. Catégories
  const categories = [
    { name: "Électronique", slug: "electronique" },
    { name: "Vêtements", slug: "vetements" },
    { name: "Livres", slug: "livres" },
    { name: "Meubles", slug: "meubles" },
    { name: "Cuisine", slug: "cuisine" },
    { name: "Sport", slug: "sport" },
    { name: "Informatique", slug: "informatique" },
    { name: "Musique", slug: "musique" },
    { name: "Vélos", slug: "velos" },
    { name: "Autres", slug: "autres" },
  ];
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  const categoryBySlug = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );
  console.log(`Catégories : ${categories.length} OK`);

  // 2. Utilisateurs (vendeurs de test)
  const users: { id: number; name: string }[] = [];

  for (let i = 0; i < SEED_USERS.length; i++) {
    const email = `test${i + 1}@univ.fr`;
    const existing = await prisma.user.findUnique({ where: { email } });
    const user = existing
      ? await prisma.user.update({
          where: { email },
          data: {
            name: SEED_USERS[i],
            imageCarteScolaire: `uploads/cartes-scolaires/seed-${i + 1}.png`,
            cardStatus: "APPROVED",
            password: null,
          },
        })
      : await prisma.user.create({
          data: {
            name: SEED_USERS[i],
            email,
            password: null,
            imageCarteScolaire: `uploads/cartes-scolaires/seed-${i + 1}.png`,
            cardStatus: "APPROVED",
          },
        });
    users.push({ id: user.id, name: user.name });
  }
  console.log(`Utilisateurs : ${users.length} OK`);

  // 3. Produits (avec images uploadées dans RustFS)
  const productIds: number[] = [];
  for (let i = 0; i < SEED_PRODUCTS.length; i++) {
    const p = SEED_PRODUCTS[i];
    const seller = users[i % users.length];
    const categoryId = categoryBySlug.get(p.categorySlug);

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        address: CAMPUSES[i % CAMPUSES.length],
        sellerId: seller.id,
        categoryId: categoryId!,
      },
    });
    productIds.push(product.id);

    if (p.imageFiles) {
      for (const [imageIndex, fileName] of p.imageFiles.entries()) {
        const img = readSeedImage(fileName);
        const key = `uploads/products/seed-${Date.now()}-${i}-${imageIndex}${img.ext}`;
        await uploadFile(img.buffer, key, img.mimetype);
        await prisma.productImage.create({
          data: { url: key, productId: product.id },
        });
      }
    }
  }
  console.log(`Produits : ${SEED_PRODUCTS.length} OK (images uploadées dans RustFS)`);

  // 4. Quelques avis (un seul par acheteur × vendeur)
  const reviewPairs = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5],
    [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [9, 11],
  ];
  for (const [reviewer, seller] of reviewPairs) {
    await prisma.review.create({
      data: {
        reviewerId: users[reviewer].id,
        sellerId: users[seller].id,
        rating: 4 + (reviewer % 2),
        comment: "Vente rapide et produit conforme à la description. Je recommande !",
      },
    }).catch(() => {});
  }
  console.log(`Avis : ${reviewPairs.length} OK`);

  // 5. Quelques wishlists
  const wishlistPairs = [
    [1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6],
  ];
  for (const [userIdx, productIdx] of wishlistPairs) {
    await prisma.wishlist.create({
      data: {
        userId: users[userIdx].id,
        productId: productIds[productIdx % productIds.length],
      },
    }).catch(() => {});
  }
  console.log(`Wishlists : ${wishlistPairs.length} OK`);

  console.log("\n=== Seed terminé ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
