import { Request, Response } from 'express';
import { favoritesService } from './favorites.service';
import { catchAsync } from '../../shared/utils/catchAsync';

export const getFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const favorites = await favoritesService.getFavorites(userId);
  res.status(200).json({ success: true, data: favorites });
});

export const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  const item = await favoritesService.addFavorite(userId, productId);
  res.status(201).json({ success: true, data: item });
});

export const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  await favoritesService.removeFavorite(userId, productId);
  res.status(200).json({ success: true, message: 'Item removed from favorites' });
});

export const clearFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await favoritesService.clearFavorites(userId);
  res.status(200).json({ success: true, message: 'Favorites cleared' });
});
