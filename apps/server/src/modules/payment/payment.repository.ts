import prisma from '../../shared/config/database';
import { Prisma } from '@prisma/client';

export class PaymentRepository {
  async createProcessedWebhook(data: Prisma.ProcessedWebhookCreateInput) {
    return prisma.processedWebhook.create({ data });
  }
}

export const paymentRepository = new PaymentRepository();
