import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from './favorites.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All favorites routes require authentication
router.use(authenticate);

// Get user's favorites
router.get('/', getFavorites);

// Clear favorites
router.delete('/', clearFavorites);

// Add product to favorites
router.post('/:productId', addFavorite);

// Remove product from favorites
router.delete('/:productId', removeFavorite);

export default router;
