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
    const from = env.SMTP_FROM || 'no-reply@shopsmart.local';

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
}

export const emailService = new EmailService();