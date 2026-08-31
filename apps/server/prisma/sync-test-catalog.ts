import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sourcePrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const targetPrisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});

async function syncProducts() {
  console.log('🔄 Syncing Categories & Products from Production DB to Test DB...');
  
  const categories = await sourcePrisma.category.findMany();
  console.log(`Found ${categories.length} categories in source DB.`);
  
  for (const cat of categories) {
    await targetPrisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image },
      create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, image: cat.image },
    });
  }

  const products = await sourcePrisma.product.findMany();
  console.log(`Found ${products.length} products in source DB.`);

  for (const prod of products) {
    await targetPrisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        basePrice: prod.basePrice,
        comparePrice: prod.comparePrice,
        stock: prod.stock,
        images: prod.images,
        categoryId: prod.categoryId,
        isVisible: prod.isVisible,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        basePrice: prod.basePrice,
        comparePrice: prod.comparePrice,
        stock: prod.stock,
        images: prod.images,
        categoryId: prod.categoryId,
        isVisible: prod.isVisible,
      },
    });
  }

  const targetProdCount = await targetPrisma.product.count();
  const targetCatCount = await targetPrisma.category.count();
  console.log(`✅ Test DB synced: ${targetCatCount} Categories, ${targetProdCount} Products.`);

  await sourcePrisma.$disconnect();
  await targetPrisma.$disconnect();
}

syncProducts().catch(console.error);
