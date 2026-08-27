import prisma from '../../shared/config/database';
import { OrderStatus } from '@prisma/client';
import { AppError } from '../../shared/utils/AppError';
import { OrderStateMachine } from '../checkout/order.state-machine';

export class OrderService {
  async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                basePrice: true,
              }
            }
          }
        },
        address: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check permissions
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && order.userId !== userId) {
      throw new AppError('Forbidden: You do not have access to this order', 403);
    }

    return order;
  }

  async getAllOrders() {
    return prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    actorId: string = 'SYSTEM',
    actorType: string = 'ADMIN'
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const nextStatus = OrderStateMachine.transition(order.status, status);

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      }),
      prisma.orderAuditLog.create({
        data: {
          orderId,
          action: 'ORDER_STATUS_UPDATED',
          oldState: order.status,
          newState: nextStatus,
          actorId,
          actorType,
        },
      }),
    ]);

    return updatedOrder;
  }
}

export const orderService = new OrderService();

