import prisma from '../../shared/config/database';


export class WishlistRepository {
  async findWishlistByUserId(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
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

  async createWishlistItem(userId: string, productId: string) {
    return prisma.wishlist.create({
      data: {
        userId,
        productId,
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

  async findWishlistItem(userId: string, productId: string) {
    return prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
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

  async removeWishlistItem(userId: string, productId: string) {
    return prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async clearWishlist(userId: string) {
    return prisma.wishlist.deleteMany({
      where: { userId },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
