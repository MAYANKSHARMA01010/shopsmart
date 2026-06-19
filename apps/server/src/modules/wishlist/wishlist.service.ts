import { AppError } from '../../shared/utils/AppError';
import { Prisma } from '@prisma/client';
import { wishlistRepository } from './wishlist.repository';

export class WishlistService {
  /**
   * Retrieves all items in the user's wishlist
   */
  async getWishlist(userId: string) {
    const wishlist = await wishlistRepository.findWishlistByUserId(userId);
    return wishlist;
  }

  /**
   * Adds a product to the user's wishlist
   */
  async addProduct(userId: string, productId: string) {
    // Verify product exists and is visible
    const product = await wishlistRepository.findProductById(productId);

    if (!product || !product.isVisible) {
      throw new AppError('Product not found or unavailable', 404);
    }

    try {
      const wishlistItem = await wishlistRepository.createWishlistItem(userId, productId);
      return wishlistItem;
    } catch (error: unknown) {
      // Prisma P2002: Unique constraint failed
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await wishlistRepository.findWishlistItem(userId, productId);
        if (existing) return existing;
      }
      throw error;
    }
  }

  /**
   * Removes a product from the user's wishlist
   */
  async removeProduct(userId: string, productId: string) {
    try {
      await wishlistRepository.removeWishlistItem(userId, productId);
      return true;
    } catch (error: unknown) {
      // Record to delete does not exist (P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Item not found in wishlist', 404);
      }
      throw error;
    }
  }

  /**
   * Clears the user's entire wishlist
   */
  async clearWishlist(userId: string) {
    await wishlistRepository.clearWishlist(userId);
    return true;
  }
}

export const wishlistService = new WishlistService();
