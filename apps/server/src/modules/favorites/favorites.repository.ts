import prisma from '../../shared/config/database';

export class FavoritesRepository {
  async findFavoritesByUserId(userId: string) {
    return prisma.favorite.findMany({
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

  async createFavoriteItem(userId: string, productId: string) {
    return prisma.favorite.create({
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

  async findFavoriteItem(userId: string, productId: string) {
    return prisma.favorite.findUnique({
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

  async removeFavoriteItem(userId: string, productId: string) {
    return prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async clearFavorites(userId: string) {
    return prisma.favorite.deleteMany({
      where: { userId },
    });
  }
}

export const favoritesRepository = new FavoritesRepository();
