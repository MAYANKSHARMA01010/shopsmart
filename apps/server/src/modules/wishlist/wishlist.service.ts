import { AppError } from '../../shared/utils/AppError';
import { Prisma } from '@prisma/client';
import { wishlistRepository } from './wishlist.repository';

export class WishlistService {
  /**
   * Retrieves all items in the user's wishlist (optionally filtered by category)
   */
  async getWishlist(userId: string, category?: string) {
    return wishlistRepository.findWishlistByUserId(userId, category);
  }

  /**
   * Adds a product to the user's wishlist category
   */
  async addProduct(userId: string, productId: string, category = 'Default') {
    const product = await wishlistRepository.findProductById(productId);

    if (!product || !product.isVisible) {
      throw new AppError('Product not found or unavailable', 404);
    }

    try {
      return await wishlistRepository.createWishlistItem(userId, productId, category);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await wishlistRepository.findWishlistItem(userId, productId, category);
        if (existing) return existing;
      }
      throw error;
    }
  }

  /**
   * Removes a product from the user's wishlist
   */
  async removeProduct(userId: string, productId: string, category?: string) {
    const result = await wishlistRepository.removeWishlistItem(userId, productId, category);
    if (result.count === 0) {
      throw new AppError('Item not found in wishlist', 404);
    }
    return true;
  }

  /**
   * Clears the user's wishlist (or category)
   */
  async clearWishlist(userId: string, category?: string) {
    await wishlistRepository.clearWishlist(userId, category);
    return true;
  }
}

export const wishlistService = new WishlistService();
