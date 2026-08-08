import "dotenv/config";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { uploadFile } from "../src/lib/storage";

// ---------------------------------------------------------------------------
// Outils : génération de PNG de couleur unie (aucune dépendance externe)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(width: number, height: number, [r, g, b]: [number, number, number]): Buffer {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const PALETTE: [number, number, number][] = [
  [52, 152, 219], [46, 204, 113], [231, 76, 60], [241, 196, 15],
  [155, 89, 182], [26, 188, 156], [230, 126, 34], [52, 73, 94],
  [236, 112, 99], [90, 120, 127], [127, 179, 213], [247, 148, 89],
];

// ---------------------------------------------------------------------------
// Images réelles de démonstration (back/uploads/products), avec repli sur des
// couleurs unies si le dossier est vide ou illisible.
// ---------------------------------------------------------------------------

const SEED_IMAGE_DIR = path.join(__dirname, "..", "uploads", "products");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SEED_IMAGES: { buffer: Buffer; mimetype: string; ext: string }[] = (() => {
  try {
    return fs
      .readdirSync(SEED_IMAGE_DIR)
      .filter((f) => MIME_BY_EXT[path.extname(f).toLowerCase()])
      .map((f) => ({
        buffer: fs.readFileSync(path.join(SEED_IMAGE_DIR, f)),
        mimetype: MIME_BY_EXT[path.extname(f).toLowerCase()],
        ext: path.extname(f).toLowerCase(),
      }));
  } catch {
    return [];
  }
})();

// ---------------------------------------------------------------------------
// Données de seed
// ---------------------------------------------------------------------------

const PASSWORD = "test1234";

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
}

const SEED_PRODUCTS: SeedProduct[] = [
  // Électronique
  { name: "Casque Bluetooth Sony", price: 45, categorySlug: "electronique", description: "Casque sans fil, très bon état, batterie ~20h, livré avec câble de charge." },
  { name: "Enceinte portable JBL", price: 30, categorySlug: "electronique", description: "Petite enceinte Bluetooth, son clair, idéale chambre. Vendue avec notice." },
  { name: "Chargeur USB-C 65W", price: 12, categorySlug: "electronique", description: "Chargeur rapide pour ordinateur et téléphone, compatible PD." },
  { name: "Écouteurs sans fil", price: 20, categorySlug: "electronique", description: "Écouteurs TWS, boîtier de charge inclus, presque neufs." },
  { name: "Montre connectée", price: 50, categorySlug: "electronique", description: "Suivi sport, notifications, batterie 7 jours. Rayures légères." },
  // Informatique
  { name: "Clavier mécanique", price: 35, categorySlug: "informatique", description: "Switchs rouges, rétroéclairage RGB, très agréable pour coder." },
  { name: "Souris gaming", price: 15, categorySlug: "informatique", description: "Souris 6 boutons, capteur 8000 dpi, légèrement usée mais parfaite." },
  { name: "Disque dur externe 1 To", price: 40, categorySlug: "informatique", description: "SSD externe, formaté, prêt à l'emploi, vendu avec câble USB-C." },
  { name: "Webcam Full HD", price: 25, categorySlug: "informatique", description: "Webcam 1080p pour cours en ligne, micro intégré." },
  { name: "Hub USB 7 ports", price: 10, categorySlug: "informatique", description: "Hub alimenté, parfait pour brancher clavier, souris et disque." },
  // Livres
  { name: "Manuel de maths L1", price: 15, categorySlug: "livres", description: "Cours et exercices corrigés, quelques annotations au crayon." },
  { name: "L'Étranger - Camus", price: 5, categorySlug: "livres", description: "Édition poche en très bon état, lecture obligatoire en licence." },
  { name: "Code civil 2026", price: 12, categorySlug: "livres", description: "Dernière édition, annoté en fluo sur les articles clés." },
  { name: "Biologie cellulaire", price: 10, categorySlug: "livres", description: "Manuel universitaire complet, couverture légèrement pliée." },
  { name: "Dictionnaire anglais-français", price: 8, categorySlug: "livres", description: "800 pages, idéal pour la préparation du TOEIC." },
  // Vêtements
  { name: "Veste de survêtement", price: 25, categorySlug: "vetements", description: "Veste taille M, portée 2 fois, comme neuve." },
  { name: "Jean taille M", price: 18, categorySlug: "vetements", description: "Jean slim, bonne coupe, léger effet usé volontaire." },
  { name: "T-shirt promotion", price: 5, categorySlug: "vetements", description: "Lot de 2 t-shirts taille L, coton épais." },
  { name: "Chaussures running", price: 30, categorySlug: "vetements", description: "Pointure 42, semelle encore bonne, nettoyées." },
  { name: "Écharpe en laine", price: 8, categorySlug: "vetements", description: "Écharpe chaude, plusieurs couleurs, jamais portée." },
  // Meubles
  { name: "Table de chevet", price: 20, categorySlug: "meubles", description: "Bois clair, 2 tiroirs, parfait pour petit espace." },
  { name: "Chaise de bureau", price: 25, categorySlug: "meubles", description: "Chaise réglable, dossier confortable, roulettes." },
  { name: "Lampe de bureau LED", price: 12, categorySlug: "meubles", description: "3 intensités, pliable, éclairage doux." },
  { name: "Petit canapé", price: 80, categorySlug: "meubles", description: "Canapé 2 places, tissu gris, quelques taches légères." },
  // Cuisine
  { name: "Casserole inox", price: 12, categorySlug: "cuisine", description: "Casserole 20 cm, inox, fond compatible induction." },
  { name: "Cafetière filtre", price: 22, categorySlug: "cuisine", description: "Cafetière 8 tasses, détartrée, filtre réutilisable inclus." },
  { name: "Set de couverts", price: 10, categorySlug: "cuisine", description: "Service 6 personnes, inox, complet." },
  { name: "Micro-ondes", price: 45, categorySlug: "cuisine", description: "20L, 700W, fonctionne parfaitement, à récupérer sur place." },
  // Sport
  { name: "Tapis de yoga", price: 15, categorySlug: "sport", description: "Tapis épais 6mm, avec sangle de transport." },
  { name: "Ballon de foot", price: 12, categorySlug: "sport", description: "Ballon taille 5, très bon état, gonflé." },
  { name: "Altères 2x5 kg", price: 25, categorySlug: "sport", description: "Paire d'altères caoutchoutées, parfait pour la chambre." },
  { name: "Sac de sport", price: 10, categorySlug: "sport", description: "Sac 40L, poche chaussures, léger." },
  // Musique
  { name: "Guitare acoustique", price: 60, categorySlug: "musique", description: "Guitare folk, cordes neuves, vendue avec housse." },
  { name: "Clavier MIDI 49 touches", price: 45, categorySlug: "musique", description: "Idéal pour MAO, pads et molettes en état neuf." },
  { name: "Casque de monitoring", price: 35, categorySlug: "musique", description: "Casque studio, son neutre, confortable." },
  // Vélos
  { name: "Vélo de ville", price: 90, categorySlug: "velos", description: "Vélo 7 vitesses, révisé, antivol inclus." },
  { name: "Casque vélo", price: 15, categorySlug: "velos", description: "Taille M, aérations, léger." },
  { name: "Antivol U", price: 10, categorySlug: "velos", description: "Antivol en U avec clés, très robuste." },
  // Autres
  { name: "Sac à dos 25L", price: 18, categorySlug: "autres", description: "Sac à dos imperméable, compartiment ordinateur 15 pouces." },
  { name: "Parapluie automatique", price: 8, categorySlug: "autres", description: "Parapluie pliant, ouverture automatique, jamais utilisé." },
  { name: "Lunettes de soleil", price: 10, categorySlug: "autres", description: "Monture noire, verres polarisés, étui inclus." },
  { name: "Rallonge 5 m", price: 6, categorySlug: "autres", description: "Rallonge 5 prises avec interrupteur." },
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
  const hashed = await bcrypt.hash(PASSWORD, 10);
  const users: { id: number; name: string }[] = [];

  const adminEmail = "admin@univ.fr";
  if (!(await prisma.user.findUnique({ where: { email: adminEmail } }))) {
    await prisma.user.create({
      data: {
        name: "Administrateur",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
        cardStatus: "APPROVED",
      },
    });
    console.log("Admin : admin@univ.fr / admin1234 OK");
  }

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
          },
        })
      : await prisma.user.create({
          data: {
            name: SEED_USERS[i],
            email,
            password: hashed,
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

    if (SEED_IMAGES.length > 0) {
      const img = SEED_IMAGES[i % SEED_IMAGES.length];
      const key = `uploads/products/seed-${Date.now()}-${i}${img.ext}`;
      await uploadFile(img.buffer, key, img.mimetype);
      await prisma.productImage.create({
        data: { url: key, productId: product.id },
      });
    } else {
      const color = PALETTE[i % PALETTE.length];
      const png = makePng(800, 600, color);
      const key = `uploads/products/seed-${Date.now()}-${i}.png`;
      await uploadFile(png, key, "image/png");
      await prisma.productImage.create({
        data: { url: key, productId: product.id },
      });
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
  console.log(`Identifiants : test1@univ.fr … test${users.length}@univ.fr / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
