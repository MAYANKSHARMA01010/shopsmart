import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailService } from '../src/modules/email/email.service';

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email using fallback JSON transport when SMTP credentials not provided', async () => {
    await expect(
      emailService.send({
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'This is a test email.',
        html: '<p>This is a test email.</p>',
      })
    ).resolves.not.toThrow();
  });

  it('sends order confirmation email successfully', async () => {
    await expect(
      emailService.sendOrderConfirmation({
        to: 'customer@example.com',
        customerName: 'Mayank',
        orderId: 'order-12345',
        totalAmount: '499.00',
        currency: 'INR',
      })
    ).resolves.not.toThrow();
  });
});
