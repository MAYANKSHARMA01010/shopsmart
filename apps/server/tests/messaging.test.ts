import { describe, it, expect } from 'vitest';
import { env } from '../src/shared/config/env';
import { whatsappService } from '../src/modules/sms/whatsapp.service';
import { smsService } from '../src/modules/sms/sms.service';

describe('Messaging Services — WhatsApp & SMS Live Dispatch', () => {
  const targetPhone = env.TEST_TARGET_PHONE;
  const testMessage = 'Hello from Mayank Sharma Shopsmart';

  it('sends custom WhatsApp message to target phone number', async () => {
    if (!targetPhone) {
      throw new Error('TEST_TARGET_PHONE is not defined in environment.');
    }
    const success = await whatsappService.sendMessage(targetPhone, testMessage);
    expect(success).toBe(true);
  }, 20_000);

  it('sends custom SMS message to target phone number via SMS Gateway', async () => {
    if (!targetPhone) {
      throw new Error('TEST_TARGET_PHONE is not defined in environment.');
    }
    const success = await smsService.sendMessage(targetPhone, testMessage);
    expect(success).toBe(true);
  }, 35_000);
});
