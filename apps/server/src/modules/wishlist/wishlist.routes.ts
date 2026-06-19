import { Router } from 'express';
import { getWishlist, addProduct, removeProduct, clearWishlist } from './wishlist.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', getWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

// Add product to wishlist
router.post('/:productId', addProduct);

// Remove product from wishlist
router.delete('/:productId', removeProduct);

export default router;
