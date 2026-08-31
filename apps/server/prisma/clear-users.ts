import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const urls = [
  { name: 'DATABASE_URL', url: process.env.DATABASE_URL },
  { name: 'TEST_DATABASE_URL', url: process.env.TEST_DATABASE_URL },
].filter((item): item is { name: string; url: string } => Boolean(item.url));

async function clearUsers() {
  for (const { name, url } of urls) {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      console.log(`Clearing all users from [${name}]...`);
      // Disconnect vendorId in products first so deleting users won't cascade delete products
      await prisma.product.updateMany({ data: { vendorId: null } });
      
      // Delete transactional tables created by tests
      await prisma.processedWebhook.deleteMany();
      await prisma.orderAuditLog.deleteMany();
      await prisma.payment.deleteMany();
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();

      // Delete user relations
      await prisma.refreshToken.deleteMany();
      await prisma.passwordResetToken.deleteMany();
      await prisma.cartItem.deleteMany();
      await prisma.cart.deleteMany();
      await prisma.wishlist.deleteMany();
      await prisma.favorite.deleteMany();
      await prisma.address.deleteMany();
      await prisma.coupon.deleteMany();

      // Delete all users
      const deleted = await prisma.user.deleteMany();
      const userCount = await prisma.user.count();
      const prodCount = await prisma.product.count();
      const catCount = await prisma.category.count();
      console.log(`✅ [${name}] Deleted users: ${deleted.count}. Total users: ${userCount}. Products preserved: ${prodCount}, Categories preserved: ${catCount}.`);
    } catch (err) {
      console.error(`Error on [${name}]:`, err);
    } finally {
      await prisma.$disconnect();
    }
  }
}

clearUsers().catch(console.error);
