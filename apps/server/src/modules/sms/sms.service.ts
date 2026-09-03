import { env } from '../../shared/config/env';
import logger from '../../shared/utils/logger';

/**
 * Universal SMS Service supporting:
 *  1. InfiniReach Cloud API (https://api.infinireach.io/api/v1/messages via X-API-Key)
 *  2. SMSGate Cloud API (https://api.sms-gate.app/3rdparty/v1/messages via Basic Auth)
 *  3. Local/Direct Android Phone Relay (custom SMS_GATEWAY_URL)
 */
export class SmsService {
  /**
   * Sends any custom text message via connected SMS Gateway / InfiniReach
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    // Normalize phone number to E.164 (+91XXXXXXXXXX)
    const digits = phone.replace(/\D/g, '');
    const targetPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;

    const controller = new AbortController();
    const timeoutMs = Number(env.SMS_GATEWAY_TIMEOUT_MS);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // -----------------------------------------------------------------------
      // Option 1: InfiniReach Cloud (API Key Authentication)
      // -----------------------------------------------------------------------
      if (env.SMS_GATEWAY_API_KEY) {
        if (!env.SMS_GATEWAY_URL) {
          logger.warn('sms.message.skipped', {
            reason: 'SMS_GATEWAY_URL is not configured in environment.',
          });
          return false;
        }

        if (!env.SMS_GATEWAY_SENDER_PHONE) {
          logger.warn('sms.message.skipped', {
            reason: 'SMS_GATEWAY_SENDER_PHONE is not configured in environment.',
          });
          return false;
        }

        const url = env.SMS_GATEWAY_URL;
        const fromPhone = env.SMS_GATEWAY_SENDER_PHONE;

        const payload = {
          to: targetPhone,
          message,
          from: fromPhone,
          channel: 'sms',
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': env.SMS_GATEWAY_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const body = await response.json().catch(() => ({})) as Record<string, unknown>;

        if (response.ok && body.success !== false) {
          logger.info('sms.message.sent', { provider: 'infinireach', phone: targetPhone, status: response.status });
          return true;
        }

        logger.warn('sms.message.rejected', {
          provider: 'infinireach',
          phone: targetPhone,
          status: response.status,
          error: (body.errorMessage as string) || (body.errorCode as string) || 'Rejected by gateway',
          details: body,
        });
        return false;
      }

      // -----------------------------------------------------------------------
      // Option 2: SMSGate Cloud (Username + Password Basic Auth)
      // -----------------------------------------------------------------------
      if (env.SMS_GATEWAY_USER && env.SMS_GATEWAY_PASSWORD) {
        if (!env.SMS_GATEWAY_URL) {
          logger.warn('sms.message.skipped', {
            reason: 'SMS_GATEWAY_URL is not configured in environment.',
          });
          return false;
        }

        const url = env.SMS_GATEWAY_URL;
        const basicAuth = Buffer.from(`${env.SMS_GATEWAY_USER}:${env.SMS_GATEWAY_PASSWORD}`).toString('base64');

        const payload = {
          textMessage: { text: message },
          phoneNumbers: [targetPhone],
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const body = await response.json().catch(() => ({})) as Record<string, unknown>;

        if (response.ok) {
          logger.info('sms.message.sent', { provider: 'smsgate', phone: targetPhone, status: response.status });
          return true;
        }

        logger.warn('sms.message.rejected', {
          provider: 'smsgate',
          phone: targetPhone,
          status: response.status,
          details: body,
        });
        return false;
      }

      logger.warn('sms.message.skipped', {
        reason: 'No SMS Gateway credentials configured in .env. Set SMS_GATEWAY_API_KEY (InfiniReach) or SMS_GATEWAY_USER/PASSWORD (SMSGate).',
      });
      return false;
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.warn('sms.message.failed', {
        phone: targetPhone,
        error: err.message,
      });
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Dispatches OTP via SMS Gateway
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `ShopSmart: Your security verification code is ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendMessage(phone, message);
  }
}

export const smsService = new SmsService();
