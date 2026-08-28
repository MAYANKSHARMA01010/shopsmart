import { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';
import { catchAsync } from '../../shared/utils/catchAsync';

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const category = req.query.category ? String(req.query.category) : undefined;
  const wishlist = await wishlistService.getWishlist(userId, category);
  res.status(200).json({ success: true, data: wishlist });
});

export const addProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  const category = req.body?.category ? String(req.body.category) : 'Default';
  const item = await wishlistService.addProduct(userId, productId, category);
  res.status(201).json({ success: true, data: item });
});

export const removeProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  const category = req.query.category ? String(req.query.category) : undefined;
  await wishlistService.removeProduct(userId, productId, category);
  res.status(200).json({ success: true, message: 'Item removed from wishlist' });
});

export const clearWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const category = req.query.category ? String(req.query.category) : undefined;
  await wishlistService.clearWishlist(userId, category);
  res.status(200).json({ success: true, message: 'Wishlist cleared' });
});
