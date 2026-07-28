import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const categories = [
  { name: 'Électronique', slug: 'electronique' },
  { name: 'Vêtements', slug: 'vetements' },
  { name: 'Livres', slug: 'livres' },
  { name: 'Meubles', slug: 'meubles' },
  { name: 'Cuisine', slug: 'cuisine' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Informatique', slug: 'informatique' },
  { name: 'Musique', slug: 'musique' },
  { name: 'Vélos', slug: 'velos' },
  { name: 'Autres', slug: 'autres' },
];

async function main() {
  console.log('Insertion des catégories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  ✓ ${category.name}`);
  }

  console.log('Terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
