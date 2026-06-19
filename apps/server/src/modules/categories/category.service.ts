import { AppError } from '../../shared/utils/AppError';
import redis from '../../shared/utils/redis';
import logger from '../../shared/utils/logger';
import type { CategoryCreateInput, CategoryNode, CategoryUpdateInput } from './category.types';
import { categoryRepository, CategoryWithRelations } from './category.repository';

class CategoryService {
  private readonly TREE_CACHE_KEY = 'categories:tree';
  private readonly TREE_CACHE_TTL = 3600; // 1 hour

  async getCategoryTree(): Promise<CategoryNode[]> {
    try {
      const cached = await redis.get(this.TREE_CACHE_KEY);
      if (cached) {
        logger.info('Serving categories from cache');
        return JSON.parse(cached) as CategoryNode[];
      }
    } catch {
      logger.warn('Redis Cache Error (Get): Continuing with Database');
    }

    const categories = await categoryRepository.getAllCategories();

    const nodes = new Map<string, CategoryNode>();
    categories.forEach((category) => {
      nodes.set(category.id, {
        ...category,
        children: [],
      });
    });

    const roots: CategoryNode[] = [];
    nodes.forEach((node) => {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortChildren = (node: CategoryNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortChildren);
    };

    roots.forEach(sortChildren);

    try {
      await redis.setex(this.TREE_CACHE_KEY, this.TREE_CACHE_TTL, JSON.stringify(roots));
    } catch {
      logger.warn('Redis Cache Error (Set): Continuing without cache');
    }

    return roots;
  }

  async getCategoryById(id: string): Promise<CategoryWithRelations> {
    const category = await categoryRepository.findCategoryById(id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async createCategory(input: CategoryCreateInput): Promise<CategoryWithRelations> {
    await this.ensureUniqueName(input.name);

    if (input.parentId) {
      await this.ensureParentExists(input.parentId);
    }

    const baseSlug = input.slug ?? this.generateSlug(input.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const category = await categoryRepository.createCategory({
      name: input.name,
      slug,
      description: input.description ?? null,
      image: input.image ?? null,
      ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {})
    });

    await this.invalidateCategoryCache();

    return category;
  }

  async updateCategory(id: string, input: CategoryUpdateInput): Promise<CategoryWithRelations> {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    if (input.parentId && input.parentId === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }

    if (input.parentId) {
      await this.ensureParentExists(input.parentId);
    }

    if (input.name) {
      await this.ensureUniqueName(input.name, id);
    }

    let slug: string | undefined;
    if (input.slug) {
      slug = await this.ensureUniqueSlug(input.slug, id);
    }

    const category = await categoryRepository.updateCategory(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(slug !== undefined && { slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.image !== undefined && { image: input.image }),
      ...(input.parentId === null 
        ? { parent: { disconnect: true } } 
        : input.parentId !== undefined 
          ? { parent: { connect: { id: input.parentId } } } 
          : {}),
    });

    await this.invalidateCategoryCache();

    return category;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    const productCount = await categoryRepository.countProductsByCategoryId(id);
    if (productCount > 0) {
      throw new AppError('Cannot delete category with existing products', 409);
    }

    await categoryRepository.deleteCategory(id);
    await this.invalidateCategoryCache();

    return { message: 'Category deleted successfully' };
  }

  private async ensureParentExists(parentId: string): Promise<void> {
    const parent = await categoryRepository.findCategoryById(parentId);
    if (!parent) {
      throw new AppError('Parent category not found', 400);
    }
  }

  private async ensureUniqueName(name: string, excludeId?: string): Promise<void> {
    const existing = await categoryRepository.findCategoryByName(name);
    if (existing && existing.id !== excludeId) {
      throw new AppError('Category name already exists', 409);
    }
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = slug;
    const hasConflict = async (value: string) => {
      const existing = await categoryRepository.findCategoryBySlug(value);
      return existing && existing.id !== excludeId;
    };

    while (await hasConflict(candidate)) {
      const suffix = Math.random().toString(36).substring(2, 6);
      candidate = `${slug}-${suffix}`;
    }

    return candidate;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private async invalidateCategoryCache(): Promise<void> {
    try {
      await redis.del(this.TREE_CACHE_KEY);
    } catch {
      logger.warn('Redis Cache Error (Delete): Continuing without cache');
    }
  }
}

export default new CategoryService();
