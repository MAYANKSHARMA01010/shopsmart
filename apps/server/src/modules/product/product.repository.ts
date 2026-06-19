import prisma from '../../shared/config/database';
import type { Prisma } from '@prisma/client';

export const productWithCategoryInclude = {
  include: { category: true },
} satisfies Prisma.ProductDefaultArgs;

export type ProductWithCategoryPayload = Prisma.ProductGetPayload<typeof productWithCategoryInclude>;

export class ProductRepository {
  async findProductsWithPagination(
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    skip: number,
    take: number
  ): Promise<[ProductWithCategoryPayload[], number]> {
    return prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);
  }

  async findProductById(id: string): Promise<ProductWithCategoryPayload | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findProductBySlug(slug: string): Promise<ProductWithCategoryPayload | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  async findCategoryById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  async createProduct(data: Prisma.ProductCreateInput): Promise<ProductWithCategoryPayload> {
    return prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithCategoryPayload> {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}

export const productRepository = new ProductRepository();
