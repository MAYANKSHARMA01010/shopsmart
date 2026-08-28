import { AppError } from '../../shared/utils/AppError';
import { Prisma } from '@prisma/client';
import { favoritesRepository } from './favorites.repository';

export class FavoritesService {
  /**
   * Retrieves all favorite items for the authenticated user
   */
  async getFavorites(userId: string) {
    return favoritesRepository.findFavoritesByUserId(userId);
  }

  /**
   * Adds a product to user's favorites
   */
  async addFavorite(userId: string, productId: string) {
    const product = await favoritesRepository.findProductById(productId);

    if (!product || !product.isVisible) {
      throw new AppError('Product not found or unavailable', 404);
    }

    try {
      return await favoritesRepository.createFavoriteItem(userId, productId);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await favoritesRepository.findFavoriteItem(userId, productId);
        if (existing) return existing;
      }
      throw error;
    }
  }

  /**
   * Removes a product from user's favorites
   */
  async removeFavorite(userId: string, productId: string) {
    try {
      await favoritesRepository.removeFavoriteItem(userId, productId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Item not found in favorites', 404);
      }
      throw error;
    }
  }

  /**
   * Clears all user's favorites
   */
  async clearFavorites(userId: string) {
    await favoritesRepository.clearFavorites(userId);
    return true;
  }
}

export const favoritesService = new FavoritesService();
