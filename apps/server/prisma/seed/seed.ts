/**
 * ShopSmart — Phase 1 Seed
 * Deterministic, idempotent seed using upsert throughout.
 * Running this script multiple times is safe — it will not create duplicates.
 *
 * Execution order (strict — do not reorder):
 *   1. Categories   (required before products)
 *   2. Admin user
 *   3. Products     (requires category IDs)
 *   4. Admin cart   (dev/staging only)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../../src/shared/config/env';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ─── Types ─────────────────────────────────────────────────────────────────

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
}

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  stock: number;
  images: string[];
  categorySlug: string;
}

// ─── 1. Categories ─────────────────────────────────────────────────────────

const CATEGORIES: CategorySeed[] = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and computing' },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and garden' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and activewear' },
  { name: 'Toys', slug: 'toys', description: 'Games and toys for all ages' },
  { name: 'Books', slug: 'books', description: 'Print and digital books' },
  {
    name: 'Uncategorized',
    slug: 'uncategorized',
    description: 'Migration safety catch-all — do not delete',
  },
];

async function seedCategories(): Promise<Map<string, string>> {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const all = await prisma.category.findMany({ select: { slug: true, id: true } });
  const map = new Map(all.map((c) => [c.slug, c.id]));
  console.log(`✓ Categories: ${all.length} seeded`);
  return map;
}

// ─── 2. Admin User ─────────────────────────────────────────────────────────

async function seedUsers(): Promise<{ adminId: string; vendorId: string; vendor2Id: string }> {
  const usersToSeed = [
    {
      name: 'ShopSmart Admin',
      email: 'admin@shopsmart.dev',
      username: 'admin',
      password: 'Admin@123456',
      role: 'SUPER_ADMIN',
    },
    {
      name: 'TestCustomer',
      email: 'TestCustomer69@gmail.com',
      username: 'TestCustomer69',
      password: 'TestCustomer69@gmail.com',
      role: 'CUSTOMER',
    },
    {
      name: 'TestAdmin',
      email: 'TestAdmin69@gmail.com',
      username: 'TestAdmin69',
      password: 'TestAdmin69@gmail.com',
      role: 'ADMIN',
    },
    {
      name: 'TestSuperAdmin',
      email: 'TestSuperAdmin69@gmail.com',
      username: 'TestSuperAdmin69',
      password: 'TestSuperAdmin69@gmail.com',
      role: 'SUPER_ADMIN',
    },
    {
      name: 'TestVendor',
      email: 'TestVendor69@gmail.com',
      username: 'TestVendor69',
      password: 'TestVendor69@gmail.com',
      role: 'VENDOR',
    },
    {
      name: 'TestVendor',
      email: 'TestVendor692@gmail.com',
      username: 'TestVendor692',
      password: 'TestVendor692@gmail.com',
      role: 'VENDOR',
    },
  ];

  let mainAdminId = '';
  let vendorId = '';
  let vendor2Id = '';

  for (const u of usersToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    
    if (existing) {
      if (existing.role !== u.role) {
        await prisma.user.update({
          where: { email: u.email },
          data: { role: u.role as any },
        });
        console.log(`✓ User ${u.email} already exists — updated role to ${u.role}`);
      } else {
        console.log(`✓ User ${u.email} already exists — skipping`);
      }
      if (u.email === 'admin@shopsmart.dev') mainAdminId = existing.id;
      if (u.email === 'TestVendor69@gmail.com') vendorId = existing.id;
      if (u.email === 'TestVendor692@gmail.com') vendor2Id = existing.id;
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        username: u.username,
        password: hashedPassword,
        role: u.role as any,
        isEmailVerified: true,
      },
    });

    console.log(`✓ User created: ${user.email} (role: ${user.role})`);
    if (u.email === 'admin@shopsmart.dev') mainAdminId = user.id;
    if (u.email === 'TestVendor69@gmail.com') vendorId = user.id;
    if (u.email === 'TestVendor692@gmail.com') vendor2Id = user.id;

    // Create a cart for each user
    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  return { adminId: mainAdminId, vendorId, vendor2Id };
}

// ─── 3. Products ───────────────────────────────────────────────────────────

async function seedProducts(categoryMap: Map<string, string>, vendorId: string, vendor2Id: string): Promise<void> {
  const catalogPath = path.join(__dirname, 'catalog.json');
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  for (const product of catalogData) {
    const categoryId = categoryMap.get(product.category);
    if (!categoryId) {
      console.warn(`Category not found: ${product.category}`);
      continue;
    }

    const assignedVendor = product.vendor === 'vendor1' ? vendorId : vendor2Id;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        vendorId: assignedVendor,
        basePrice: product.basePrice,
        stock: product.stock,
        images: product.images,
        name: product.name,
        description: product.description,
        categoryId: categoryId,
        isVisible: true
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        stock: product.stock,
        images: product.images,
        isVisible: true,
        categoryId: categoryId,
        vendorId: assignedVendor,
      },
    });
  }

  console.log(`✓ Realistic Products: ${catalogData.length} seeded`);
}


// ─── 4. Admin Cart ─────────────────────────────────────────────────────────

async function seedAdminCart(adminId: string): Promise<void> {
  await prisma.cart.upsert({
    where: { userId: adminId },
    update: {},
    create: { userId: adminId },
  });
  console.log('✓ Admin cart created');
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const isProduction = env.NODE_ENV === 'production';
  console.log(`\n🌱 ShopSmart Phase 1 Seed (env: ${env.NODE_ENV})\n`);

  if (!isProduction) {
    console.log('🧹 Wiping all old data from development database...');
    // Delete in order of dependencies to avoid foreign key constraints
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Old data removed');
  }

  // Step 1: Categories
  const categoryMap = await seedCategories();

  // Step 2: Users
  const { adminId, vendorId, vendor2Id } = await seedUsers();

  // Step 3: Products
  await seedProducts(categoryMap, vendorId, vendor2Id);

  // Step 4: Admin cart (dev/staging only)
  if (!isProduction) {
    await seedAdminCart(adminId);
  }

  console.log('\n✅ Seed complete\n');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
