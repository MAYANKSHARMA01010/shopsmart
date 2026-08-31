import axios from 'axios';
import { env } from '../../shared/config/env';
import logger from '../../shared/utils/logger';


export class WhatsappService {
  /**
   * Formats an Indian phone number (+91XXXXXXXXXX) to WhatsApp JID format (91XXXXXXXXXX@c.us)
   */
  private formatJid(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    const cleanNumber = digits.length === 10 ? `91${digits}` : digits;
    return `${cleanNumber}@c.us`;
  }

  /**
   * Dispatches OTP via WAHA (WhatsApp HTTP API)
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const chatId = this.formatJid(phone);
    const message = `🛍️ *ShopSmart Security Code*\n\nYour verification code is: *${otp}*\n\n⏱️ This code expires in *5 minutes*. Please do not share this code with anyone.`;

    const url = `${env.WAHA_API_URL.replace(/\/$/, '')}/api/sendText`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (env.WAHA_API_KEY) {
      headers['X-Api-Key'] = env.WAHA_API_KEY;
    }

    const payload = {
      session: env.WAHA_SESSION || 'default',
      chatId,
      text: message,
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 8000,
      });

      logger.info('whatsapp.otp.sent', {
        phone,
        chatId,
        status: response.status,
      });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      logger.warn('whatsapp.otp.failed', {
        phone,
        chatId,
        error: err.message,
        statusCode: err.response?.status,
        note: 'WAHA service may be offline or not paired via QR code.',
      });
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();
