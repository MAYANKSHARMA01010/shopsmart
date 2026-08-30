import api from '../../../lib/apiClient';

export interface InitializeCheckoutParams {
  addressId: string;
  gatewayProvider: 'RAZORPAY' | 'STRIPE';
  couponCode?: string;
  notes?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const checkoutService = {
  initializeCheckout: async (params: InitializeCheckoutParams, idempotencyKey?: string) => {
    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    const res: any = await api.post('/checkout/initialize', params, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return res;
  },

  verifyPayment: async (params: VerifyPaymentParams) => {
    const res: any = await api.post('/payment/verify', params);
    return res;
  }
};
