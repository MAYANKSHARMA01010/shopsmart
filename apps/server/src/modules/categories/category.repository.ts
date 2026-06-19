import prisma from '../../shared/config/database';
import { Prisma } from '@prisma/client';

export const categoryWithRelations = {
  include: {
    parent: true,
    children: { orderBy: { name: 'asc' } },
  },
} satisfies Prisma.CategoryDefaultArgs;

export type CategoryWithRelations = Prisma.CategoryGetPayload<typeof categoryWithRelations>;

export class CategoryRepository {
  async getAllCategories() {
    return prisma.category.findMany({
      where: { slug: { not: 'uncategorized' } },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
      },
    });
  }

  async findCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: categoryWithRelations.include,
    });
  }

  async findCategoryByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async findCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
      include: categoryWithRelations.include,
    });
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
      include: categoryWithRelations.include,
    });
  }

  async countProductsByCategoryId(categoryId: string) {
    return prisma.product.count({
      where: { categoryId },
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
