import { Router } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import type { Request, Response } from 'express';

const router = Router();

/**
 * GET /api/categories
 * Returns all categories ordered by name.
 * Excludes 'uncategorized' from the public listing.
 */
router.get(
  '/',
  catchAsync(async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
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

    res.json({ data: categories });
  })
);

/**
 * GET /api/categories/:slug
 * Returns a single category with its products.
 */
router.get(
  '/:slug',
  catchAsync(async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ data: category });
  })
);

export default router;
