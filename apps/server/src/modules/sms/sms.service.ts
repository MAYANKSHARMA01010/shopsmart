import axios from 'axios';
import { env } from '../../shared/config/env';
import logger from '../../shared/utils/logger';

export class SmsService {
  /**
   * Dispatches OTP via Open-Source Android SMS Gateway (Docker / Self-Hosted on Render)
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `ShopSmart: Your security verification code is ${otp}. Valid for 5 minutes. Please do not share.`;
    const targetPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;

    const baseUrl = env.SMS_GATEWAY_URL.replace(/\/$/, '');
    const url = baseUrl.endsWith('/message') ? baseUrl : `${baseUrl}/message`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (env.SMS_GATEWAY_USER && env.SMS_GATEWAY_PASSWORD) {
      const basicAuth = Buffer.from(`${env.SMS_GATEWAY_USER}:${env.SMS_GATEWAY_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    } else if (env.SMS_GATEWAY_API_KEY) {
      headers['Authorization'] = `Bearer ${env.SMS_GATEWAY_API_KEY}`;
    }

    // Standard Android SMS Gateway JSON payload (sends to any number via phone SIM)
    const payload = {
      phoneNumbers: [targetPhone],
      message,
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 8000,
      });

      logger.info('sms.otp.sent', {
        phone: targetPhone,
        status: response.status,
      });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      logger.warn('sms.otp.failed', {
        phone: targetPhone,
        error: err.message,
        statusCode: err.response?.status,
        note: 'Android SMS Gateway server may be offline or phone not connected.',
      });
      return false;
    }
  }
}

export const smsService = new SmsService();
