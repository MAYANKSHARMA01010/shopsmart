import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../shared/config/env';
import logger from '../../shared/utils/logger';

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type OrderConfirmationPayload = {
  to: string;
  customerName?: string | null;
  orderId: string;
  totalAmount: string;
  currency: string;
};

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const hasSmtpCredentials = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    if (hasSmtpCredentials) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      return this.transporter;
    }

    // Free fallback for local/dev: logs the generated message payload instead of sending.
    this.transporter = nodemailer.createTransport({ jsonTransport: true });
    logger.warn('SMTP credentials are missing. Email queue will use JSON transport fallback.');
    return this.transporter;
  }

  async send(message: EmailMessage): Promise<void> {
    const transporter = this.getTransporter();
    if (!env.SMTP_FROM) {
      throw new Error('SMTP_FROM is not defined in environment.');
    }
    const from = env.SMTP_FROM;

    const info = await transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    logger.info('email.sent', {
      to: message.to,
      subject: message.subject,
      messageId: info.messageId,
    });
  }

  async sendOrderConfirmation(payload: OrderConfirmationPayload): Promise<void> {
    const customerName = payload.customerName?.trim() || 'Customer';
    const subject = `Order Confirmed: ${payload.orderId}`;
    const amountLine = `${payload.currency} ${payload.totalAmount}`;

    await this.send({
      to: payload.to,
      subject,
      text: `Hi ${customerName}, your order ${payload.orderId} has been confirmed. Paid amount: ${amountLine}.`,
      html: `
        <p>Hi ${customerName},</p>
        <p>Your order <strong>${payload.orderId}</strong> has been confirmed.</p>
        <p>Paid amount: <strong>${amountLine}</strong></p>
        <p>Thank you for shopping with ShopSmart.</p>
      `,
    });
  }

  async sendOtpEmail(to: string, name: string, otp: string, purpose: string = 'Email Verification'): Promise<void> {
    const customerName = name.trim() || 'User';
    const subject = `Your ShopSmart Verification Code: ${otp}`;

    await this.send({
      to,
      subject,
      text: `Hi ${customerName},\n\nYour 6-digit verification code for ${purpose} is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nShopSmart Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-top: 0;">ShopSmart Verification</h2>
          <p style="color: #4b5563; font-size: 15px;">Hi <strong>${customerName}</strong>,</p>
          <p style="color: #4b5563; font-size: 15px;">Your one-time verification code for <strong>${purpose}</strong> is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 28px; background-color: #f3f4f6; border-radius: 8px; color: #1e3a8a; border: 1px dashed #3b82f6;">
              ${otp}
            </span>
          </div>
          <p style="color: #ef4444; font-size: 14px; font-weight: 600;">⚠️ This code expires in 5 minutes and can only be used once.</p>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            If you did not make this request, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();