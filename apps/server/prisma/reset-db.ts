import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const urlsToReset = [
  { name: 'DATABASE_URL', url: process.env.DATABASE_URL },
  { name: 'TEST_DATABASE_URL', url: process.env.TEST_DATABASE_URL },
].filter((item): item is { name: string; url: string } => Boolean(item.url));

async function resetDb(name: string, url: string) {
  console.log(`\n========================================`);
  console.log(`🔄 Resetting Database [${name}]`);
  console.log(`URL Host: ${new URL(url).host}`);
  console.log(`========================================`);

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    await prisma.$connect();
    console.log(`Connected to [${name}].`);

    // 1. Unlink vendorId from all products so deleting users won't fail or cascade delete products
    const productCountBefore = await prisma.product.count();
    const categoryCountBefore = await prisma.category.count();
    console.log(`Preserving: ${productCountBefore} Products and ${categoryCountBefore} Categories.`);

    await prisma.product.updateMany({
      data: { vendorId: null },
    });

    // 2. Delete transactional and user data in safe foreign-key order
    console.log('Clearing Webhooks, Audit Logs, Payments...');
    await prisma.processedWebhook.deleteMany();
    await prisma.orderAuditLog.deleteMany();
    await prisma.payment.deleteMany();

    console.log('Clearing Order Items, Orders...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();

    console.log('Clearing Addresses...');
    await prisma.address.deleteMany();

    console.log('Clearing Cart and Wishlist/Favorites...');
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.favorite.deleteMany();

    console.log('Clearing Auth Tokens...');
    await prisma.refreshToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();

    console.log('Clearing Coupons...');
    await prisma.coupon.deleteMany();

    console.log('Clearing Users...');
    await prisma.user.deleteMany();

    // 3. Seed clean default Admin user
    console.log('Creating fresh default Super Admin user...');
    const hashedPassword = await bcrypt.hash('Password@123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@shopsmart.com',
        name: 'Super Admin',
        username: 'superadmin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });

    const productCountAfter = await prisma.product.count();
    const categoryCountAfter = await prisma.category.count();
    const userCountAfter = await prisma.user.count();

    console.log(`✅ [${name}] Database Reset Complete!`);
    console.log(`   - Products preserved: ${productCountAfter}`);
    console.log(`   - Categories preserved: ${categoryCountAfter}`);
    console.log(`   - Super Admin created: ${userCountAfter} (admin@shopsmart.com / Password@123)`);
  } catch (error) {
    console.error(`❌ Error resetting [${name}]:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const item of urlsToReset) {
    await resetDb(item.name, item.url);
  }
}

main().catch((err) => {
  console.error('Fatal reset error:', err);
  process.exit(1);
});
