import { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';
import { catchAsync } from '../../shared/utils/catchAsync';

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const wishlist = await wishlistService.getWishlist(userId);
  res.status(200).json({ success: true, data: wishlist });
});

export const addProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  const item = await wishlistService.addProduct(userId, productId);
  res.status(201).json({ success: true, data: item });
});

export const removeProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = String(req.params.productId);
  await wishlistService.removeProduct(userId, productId);
  res.status(200).json({ success: true, message: 'Item removed from wishlist' });
});

export const clearWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await wishlistService.clearWishlist(userId);
  res.status(200).json({ success: true, message: 'Wishlist cleared' });
});
