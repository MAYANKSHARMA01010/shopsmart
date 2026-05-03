import express from 'express';
import * as productController from '../controllers/productController';
import { validateProduct, productSchema, updateProductSchema } from '../validators/productValidator';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validateProduct(productSchema), productController.createProduct);
router.put('/:id', validateProduct(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
