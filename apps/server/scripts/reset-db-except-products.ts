import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import Redis from 'ioredis';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const redisUrl = process.env.REDIS_LOCAL_URL || process.env.REDIS_SERVER_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });

async function flushRedisCache(): Promise<void> {
  console.log('🔴 Flushing Redis cache (cart:*, categories:*, products:*)...');
  try {
    await redis.connect();
    // Scan and delete all cart:*, categories:*, and products:* keys in batches
    const patterns = ['cart:*', 'categories:*', 'products:*', 'category:*'];
    let flushedCount = 0;
    for (const pattern of patterns) {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
          flushedCount += keys.length;
        }
      } while (cursor !== '0');
    }
    console.log(`   ✓ Flushed ${flushedCount} Redis keys.`);
  } catch (err) {
    console.warn('   ⚠️  Redis flush failed (Redis may not be running locally). Skipping.', (err as Error).message);
  } finally {
    redis.disconnect();
  }
}

async function resetDbExceptProducts() {
  console.log('🚀 Starting Database Reset (Preserving Products & Categories)...');

  const initialProducts = await prisma.product.count();
  const initialCategories = await prisma.category.count();
  console.log(`📦 Found ${initialProducts} products and ${initialCategories} categories to preserve.`);

  // 1. Delete transactional, order, payment, and user data in safe dependency order
  console.log('🗑️  Clearing order audit logs...');
  const deletedAuditLogs = await prisma.orderAuditLog.deleteMany({});

  console.log('🗑️  Clearing payments...');
  const deletedPayments = await prisma.payment.deleteMany({});

  console.log('🗑️  Clearing processed webhooks...');
  const deletedWebhooks = await prisma.processedWebhook.deleteMany({});

  console.log('🗑️  Clearing order items...');
  const deletedOrderItems = await prisma.orderItem.deleteMany({});

  console.log('🗑️  Clearing orders...');
  const deletedOrders = await prisma.order.deleteMany({});

  console.log('🗑️  Clearing cart items...');
  const deletedCartItems = await prisma.cartItem.deleteMany({});

  console.log('🗑️  Clearing carts...');
  const deletedCarts = await prisma.cart.deleteMany({});

  console.log('🗑️  Clearing wishlists...');
  const deletedWishlists = await prisma.wishlist.deleteMany({});

  console.log('🗑️  Clearing favorites...');
  const deletedFavorites = await prisma.favorite.deleteMany({});

  console.log('🗑️  Clearing addresses...');
  const deletedAddresses = await prisma.address.deleteMany({});

  console.log('🗑️  Clearing auth tokens...');
  await prisma.passwordResetToken.deleteMany({});
  await prisma.refreshToken.deleteMany({});

  console.log('🗑️  Clearing non-admin/test user records...');
  await prisma.user.deleteMany({});

  // 2. Reseed Default Seed Users
  console.log('👤 Reseeding standard accounts...');
  const defaultUsers = [
    {
      name: 'ShopSmart Admin',
      email: 'admin@shopsmart.dev',
      username: 'admin',
      password: await bcrypt.hash('Admin@123456', 10),
      role: 'SUPER_ADMIN' as const,
      isEmailVerified: true,
    },
    {
      name: 'TestCustomer',
      email: 'TestCustomer69@gmail.com',
      username: 'TestCustomer69',
      password: await bcrypt.hash('TestCustomer69@gmail.com', 10),
      role: 'CUSTOMER' as const,
      isEmailVerified: true,
    },
    {
      name: 'TestAdmin',
      email: 'TestAdmin69@gmail.com',
      username: 'TestAdmin69',
      password: await bcrypt.hash('TestAdmin69@gmail.com', 10),
      role: 'ADMIN' as const,
      isEmailVerified: true,
    },
    {
      name: 'TestSuperAdmin',
      email: 'TestSuperAdmin69@gmail.com',
      username: 'TestSuperAdmin69',
      password: await bcrypt.hash('TestSuperAdmin69@gmail.com', 10),
      role: 'SUPER_ADMIN' as const,
      isEmailVerified: true,
    },
    {
      name: 'TestVendor',
      email: 'TestVendor69@gmail.com',
      username: 'TestVendor69',
      password: await bcrypt.hash('TestVendor69@gmail.com', 10),
      role: 'VENDOR' as const,
      isEmailVerified: true,
    },
    {
      name: 'TestVendor2',
      email: 'TestVendor692@gmail.com',
      username: 'TestVendor692',
      password: await bcrypt.hash('TestVendor692@gmail.com', 10),
      role: 'VENDOR' as const,
      isEmailVerified: true,
    },
  ];

  for (const u of defaultUsers) {
    await prisma.user.create({ data: u });
  }

  // 3. Flush Redis caches so stale cart/category data doesn't survive the reset
  await flushRedisCache();

  // 4. Reset Coupon usage
  console.log('🎟️  Resetting coupon usage counts...');
  await prisma.coupon.updateMany({
    data: {
      usedCount: 0,
      isActive: true,
    },
  });

  // 4. Ensure all preserved products have healthy stock (> 20)
  console.log('📊 Ensuring product inventory is restored to available stock...');
  await prisma.product.updateMany({
    where: { stock: { lt: 10 } },
    data: { stock: 50 },
  });

  // 5. Verification Counts
  const finalProducts = await prisma.product.count();
  const finalCategories = await prisma.category.count();
  const finalUsers = await prisma.user.count();
  const finalOrders = await prisma.order.count();
  const finalPayments = await prisma.payment.count();
  const finalCarts = await prisma.cart.count();

  console.log('\n========================================');
  console.log('✨ DATABASE RESET COMPLETE');
  console.log('========================================');
  console.log(`📦 Preserved Products:   ${finalProducts} (Intact)`);
  console.log(`📁 Preserved Categories: ${finalCategories} (Intact)`);
  console.log(`👤 Active Users:         ${finalUsers} (Reseeded)`);
  console.log(`🛒 Cart Items Cleared:   ${deletedCartItems.count}`);
  console.log(`🧾 Orders Cleared:       ${deletedOrders.count} (Now: ${finalOrders})`);
  console.log(`💳 Payments Cleared:     ${deletedPayments.count} (Now: ${finalPayments})`);
  console.log(`📍 Addresses Cleared:    ${deletedAddresses.count}`);
  console.log(`❤️  Wishlists Cleared:    ${deletedWishlists.count}`);
  console.log('========================================\n');
}

resetDbExceptProducts()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
