import prisma from '../../shared/config/database';
import { Prisma } from '@prisma/client';
import { CartWithItems } from './cart.types';

export class CartRepository {
  async getOrCreateCart(userId: string, tx?: Prisma.TransactionClient): Promise<CartWithItems> {
    const client = tx || prisma;
    const cart = await client.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return cart as CartWithItems;
  }

  async getProductById(productId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.findUnique({
      where: { id: productId },
    });
  }

  async getProductsByIds(productIds: string[], tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.findMany({
      where: {
        id: { in: productIds },
      },
    });
  }

  async upsertCartItem(cartId: string, productId: string, targetQuantity: number, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: targetQuantity,
      },
      create: {
        cartId,
        productId,
        quantity: targetQuantity,
      },
    });
  }

  async updateCartItemQuantity(itemId: string, quantity: number, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeCartItem(itemId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCartItems(cartId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async createManyCartItems(data: { cartId: string; productId: string; quantity: number }[], tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.cartItem.createMany({
      data,
    });
  }

  async executeTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}

export const cartRepository = new CartRepository();
