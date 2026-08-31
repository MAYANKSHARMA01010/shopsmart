import axios from 'axios';
import { env } from '../../shared/config/env';
import logger from '../../shared/utils/logger';


export class SmsService {
  /**
   * Dispatches OTP via httpSMS (Android SIM Carrier Gateway)
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `ShopSmart: Your security verification code is ${otp}. Valid for 5 minutes. Please do not share.`;

    const url = `${env.HTTPSMS_API_URL.replace(/\/$/, '')}/messages/send`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (env.HTTPSMS_API_KEY) {
      headers['x-api-key'] = env.HTTPSMS_API_KEY;
    }

    const payload = {
      content: message,
      from: env.HTTPSMS_FROM_PHONE || undefined,
      to: phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 8000,
      });

      logger.info('sms.otp.sent', {
        phone: payload.to,
        status: response.status,
      });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      logger.warn('sms.otp.failed', {
        phone: payload.to,
        error: err.message,
        statusCode: err.response?.status,
        note: 'httpSMS gateway may be offline or API key not set.',
      });
      return false;
    }
  }
}

export const smsService = new SmsService();
