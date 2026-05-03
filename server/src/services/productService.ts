import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import redis from '../utils/redis';
import logger from '../utils/logger';

class ProductService {
  private readonly CACHE_KEY = 'products:all';
  private readonly CACHE_TTL = 3600; // 1 hour

  async getAllProducts(filters: { category?: string; search?: string }) {
    const { category, search } = filters;
    
    // Try to get from cache if no filters
    if (!category && !search) {
      try {
        const cached = await redis.get(this.CACHE_KEY);
        if (cached) {
          logger.info('Serving products from cache');
          return JSON.parse(cached);
        }
      } catch (err) {
        logger.warn('Redis Cache Error (Get): Continuing with Database');
      }
    }

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Cache the result if no filters
    if (!category && !search) {
      try {
        await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(products));
      } catch (err) {
        // Silent fail for caching
      }
    }

    return products;
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id: Number.parseInt(id, 10) },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async createProduct(data: any) {
    const product = await prisma.product.create({
      data: {
        ...data,
        price: Number.parseFloat(data.price),
        stock: Number.parseInt(data.stock, 10) || 0,
      },
    });

    // Invalidate cache
    try {
      await redis.del(this.CACHE_KEY);
    } catch (err) {}
    
    return product;
  }

  async updateProduct(id: string, data: any) {
    const productId = Number.parseInt(id, 10);
    
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        ...(data.price !== undefined && { price: Number.parseFloat(data.price) }),
        ...(data.stock !== undefined && { stock: Number.parseInt(data.stock, 10) }),
      },
    });

    // Invalidate cache
    try {
      await redis.del(this.CACHE_KEY);
    } catch (err) {}
    
    return product;
  }

  async deleteProduct(id: string) {
    const productId = Number.parseInt(id, 10);
    
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    await prisma.product.delete({ where: { id: productId } });
    
    // Invalidate cache
    try {
      await redis.del(this.CACHE_KEY);
    } catch (err) {}
    
    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();
