import { Prisma } from '@prisma/client';
import { PaymentGateway, CreateOrderParams, VerifySignatureParams } from './payment.interface';
import { RazorpayGateway } from './razorpay.gateway';
import { AppError } from '../../shared/utils/AppError';

export class PaymentService {
  private gateway: PaymentGateway;

  constructor(provider: string = 'RAZORPAY') {
    if (provider !== 'RAZORPAY') {
      throw new AppError('Only Razorpay is supported in this deployment', 400);
    }

    this.gateway = new RazorpayGateway();
  }

  async createOrder(params: CreateOrderParams) {
    return this.gateway.createOrder(params);
  }

  async verifySignature(params: VerifySignatureParams) {
    return this.gateway.verifySignature(params);
  }

  async refund(paymentId: string, amount?: Prisma.Decimal) {
    return this.gateway.refund(paymentId, amount);
  }

  async healthCheck() {
    return this.gateway.healthCheck();
  }
}
