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
   * Sends any custom text message via WAHA (WhatsApp HTTP API)
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    if (!env.WAHA_API_URL || !env.WAHA_SESSION) {
      logger.warn('whatsapp.message.skipped', {
        reason: 'WAHA_API_URL or WAHA_SESSION is not configured in environment.',
      });
      return false;
    }

    const chatId = this.formatJid(phone);
    const url = `${env.WAHA_API_URL.replace(/\/$/, '')}/api/sendText`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (env.WAHA_API_KEY) {
      headers['X-Api-Key'] = env.WAHA_API_KEY;
    }

    const payload = {
      session: env.WAHA_SESSION,
      chatId,
      text: message,
    };

    const controller = new AbortController();
    const timeoutMs = Number(env.WAHA_TIMEOUT_MS);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response.ok) {
        logger.info('whatsapp.message.sent', {
          phone,
          chatId,
          status: response.status,
        });
        return true;
      }

      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      logger.warn('whatsapp.message.failed', {
        phone,
        chatId,
        status: response.status,
        details: errorBody,
        note: errorBody.status === 'SCAN_QR_CODE'
          ? 'WhatsApp session is not paired yet. Please scan the QR code in the WAHA dashboard.'
          : 'WAHA service error or session not ready.',
      });
      return false;
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.warn('whatsapp.message.failed', {
        phone,
        chatId,
        error: err.message,
        note: 'WAHA service may be offline or not paired via QR code.',
      });
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Dispatches OTP via WAHA (WhatsApp HTTP API)
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `🛍️ *ShopSmart Security Code*\n\nYour verification code is: *${otp}*\n\n⏱️ This code expires in *5 minutes*. Please do not share this code with anyone.`;
    return this.sendMessage(phone, message);
  }
}

export const whatsappService = new WhatsappService();
