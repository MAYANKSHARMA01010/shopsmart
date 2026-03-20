const prisma = require('../configs/database');
const logger = require('../utils/logger');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = {};

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
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number.parseInt(id, 10) },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock, 10) || 0,
        category: category || null,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: Number.parseInt(id, 10) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const product = await prisma.product.update({
      where: { id: Number.parseInt(id, 10) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number.parseFloat(price) }),
        ...(stock !== undefined && { stock: Number.parseInt(stock, 10) }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });
    res.json(product);
  } catch (error) {
    logger.error('Error updating product:', error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id: Number.parseInt(id, 10) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await prisma.product.delete({ where: { id: Number.parseInt(id, 10) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    next(error);
  }
};
