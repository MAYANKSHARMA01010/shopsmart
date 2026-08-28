import prisma from '../../shared/config/database';

export class WishlistRepository {
  async findWishlistByUserId(userId: string, category?: string) {
    const where: { userId: string; category?: string } = { userId };
    if (category && category !== 'all') {
      where.category = category;
    }

    return prisma.wishlist.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            comparePrice: true,
            stock: true,
            images: true,
            isVisible: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async createWishlistItem(userId: string, productId: string, category = 'Default') {
    return prisma.wishlist.create({
      data: {
        userId,
        productId,
        category,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            comparePrice: true,
            stock: true,
            images: true,
            isVisible: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async findWishlistItem(userId: string, productId: string, category = 'Default') {
    return prisma.wishlist.findUnique({
      where: { userId_productId_category: { userId, productId, category } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            comparePrice: true,
            stock: true,
            images: true,
            isVisible: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async removeWishlistItem(userId: string, productId: string, category?: string) {
    if (category) {
      return prisma.wishlist.deleteMany({
        where: { userId, productId, category },
      });
    }
    return prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
  }

  async clearWishlist(userId: string, category?: string) {
    const where: { userId: string; category?: string } = { userId };
    if (category && category !== 'all') {
      where.category = category;
    }
    return prisma.wishlist.deleteMany({
      where,
    });
  }
}

export const wishlistRepository = new WishlistRepository();
