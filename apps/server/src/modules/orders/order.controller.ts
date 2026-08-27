import { Request, Response } from 'express';
import { orderService } from './order.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { AppError } from '../../shared/utils/AppError';

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const orders = await orderService.getMyOrders(userId);
  res.status(200).json({ success: true, data: { orders } });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const userId = req.user!.id;
  const role = req.user!.role;

  const order = await orderService.getOrderById(orderId, userId, role);
  res.status(200).json({ success: true, data: { order } });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const role = req.user!.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'VENDOR') {
    throw new AppError('Forbidden', 403);
  }

  const orders = await orderService.getAllOrders();
  res.status(200).json({ success: true, data: { orders } });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const role = req.user!.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'VENDOR') {
    throw new AppError('Forbidden', 403);
  }

  const orderId = req.params.id as string;
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(
    orderId,
    status,
    req.user!.id,
    req.user!.role
  );
  res.status(200).json({ success: true, data: { order } });
});

