import express from 'express';
import * as productController from '../controllers/productController';
import { validateProduct, productSchema, updateProductSchema } from '../validators/productValidator';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authenticate,
  requirePermission('products:create'),
  validateProduct(productSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  requirePermission('products:update'),
  validateProduct(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('products:delete'),
  productController.deleteProduct
);

export default router;
