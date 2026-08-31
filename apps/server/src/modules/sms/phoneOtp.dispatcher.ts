import { whatsappService } from './whatsapp.service';
import { smsService } from './sms.service';
import logger from '../../shared/utils/logger';

export type PhoneOtpChannel = 'whatsapp' | 'sms';

export class PhoneOtpDispatcher {
  /**
   * Dispatches the OTP to the specified channel (strictly one at a time).
   * Defaults to 'whatsapp'.
   */
  async dispatchOtp(
    phone: string,
    otp: string,
    channel: PhoneOtpChannel = 'whatsapp'
  ): Promise<{ channelUsed: PhoneOtpChannel; success: boolean }> {
    if (channel === 'sms') {
      logger.info('phone.otp.dispatch', { phone, channel: 'sms' });
      const success = await smsService.sendOtp(phone, otp);
      return { channelUsed: 'sms', success };
    }

    // Default: WhatsApp
    logger.info('phone.otp.dispatch', { phone, channel: 'whatsapp' });
    const success = await whatsappService.sendOtp(phone, otp);
    return { channelUsed: 'whatsapp', success };
  }
}

export const phoneOtpDispatcher = new PhoneOtpDispatcher();
