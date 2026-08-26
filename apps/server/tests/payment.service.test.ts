import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../src/modules/payment/payment.service';
import { AppError } from '../src/shared/utils/AppError';

vi.mock('../src/modules/payment/razorpay.gateway', () => {
  return {
    RazorpayGateway: class {
      createOrder = vi.fn().mockResolvedValue({ gatewayOrderId: 'order_123', rawResponse: {} });
      verifySignature = vi.fn().mockResolvedValue(true);
      refund = vi.fn().mockResolvedValue({ status: 'processed', rawResponse: {} });
      healthCheck = vi.fn().mockResolvedValue(true);
    }
  };
});

describe('PaymentService', () => {
  it('resolves RAZORPAY provider successfully by default', () => {
    const service = new PaymentService();
    expect(service).toBeDefined();
  });

  it('resolves RAZORPAY provider explicitly', () => {
    const service = new PaymentService('RAZORPAY');
    expect(service).toBeDefined();
  });

  it('throws AppError for unsupported STRIPE provider', () => {
    expect(() => new PaymentService('STRIPE')).toThrow(AppError);
    expect(() => new PaymentService('STRIPE')).toThrow('Only Razorpay is supported in this deployment');
  });

  it('throws AppError for unknown provider', () => {
    expect(() => new PaymentService('PAYPAL')).toThrow(AppError);
    expect(() => new PaymentService('PAYPAL')).toThrow('Only Razorpay is supported in this deployment');
  });
});
