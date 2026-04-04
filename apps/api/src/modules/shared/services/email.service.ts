import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvService } from '../../../config/env.config';

export interface SendOTPDto {
  to: string;
  otp: string;
  type: 'login' | 'email_verification' | 'password_reset';
}

export interface SendLoginNotificationDto {
  to: string;
  accountType: 'admin' | 'customer';
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SendMessageReplyDto {
  to: string;
  customerName: string;
  originalSubject: string;
  originalMessage: string;
  replyContent: string;
}

export interface SendNewMessageNotificationDto {
  adminEmails: string[];
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.envService.get('MAIL_HOST'),
      port: this.envService.get('MAIL_PORT'),
      secure: this.envService.get('MAIL_PORT') === 465, // true for 465, false for other ports
      auth: {
        user: this.envService.get('MAIL_USER'),
        pass: this.envService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendOTP(dto: SendOTPDto): Promise<void> {
    const subject = `Your OTP for ${dto.type.replace('_', ' ')}`;
    const text = `Your OTP is: ${dto.otp}. It expires in 10 minutes.`;

    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${dto.to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] OTP: ${dto.otp}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'), // or a configured FROM address
        to: dto.to,
        subject,
        text,
      });
      this.logger.log(`OTP sent to ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${dto.to}`, error);
    }
  }

  async sendLoginNotification(dto: SendLoginNotificationDto): Promise<void> {
    const subject = 'New Login Detected';
    const text = `A new login was detected for your ${dto.accountType} account.\nTime: ${dto.loginTime}\nIP: ${dto.ipAddress}\nUser Agent: ${dto.userAgent}`;

    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${dto.to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] Login notification for ${dto.accountType} at ${dto.loginTime}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'),
        to: dto.to,
        subject,
        text,
      });
      this.logger.log(`Login notification sent to ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send login notification to ${dto.to}`, error);
    }
  }

  async sendReceipt(to: string, sale: any): Promise<void> {
    const subject = `Receipt for Sale #${sale.invoiceNumber}`;
    const itemsList = sale.items
      .map((item: any) => {
        const price = item.product?.price || 0;
        return `- ${item.product?.name || 'Item'} (x${item.quantity}): ${price.toLocaleString()} each`;
      })
      .join('\n');

    const total = sale.total || 0;
    const text = `Thank you for your business!\n\nHere is your receipt for Sale #${sale.invoiceNumber}\n\nDate: ${new Date(sale.date).toLocaleDateString()}\nTotal: ${total.toLocaleString()}\n\nItems:\n${itemsList}\n\n\nKind Regards,\nSMOKE POS`;

    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] Body: \n${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'),
        to: to,
        subject,
        text,
      });
      this.logger.log(`Receipt sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send receipt to ${to}`, error);
      throw error;
    }
  }

  /**
   * Send an email with a PDF attachment
   */
  async sendEmailWithPdf(
    to: string,
    subject: string,
    body: string,
    pdfBuffer: Buffer,
    filename: string
  ): Promise<void> {
    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] Body: ${body}`);
      this.logger.log(`[DEV EMAIL] Attachment: ${filename} (${pdfBuffer.length} bytes)`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'),
        to,
        subject,
        text: body,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      this.logger.log(`Email with PDF "${filename}" sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email with PDF to ${to}`, error);
      throw error;
    }
  }

  /**
   * Send a reply to a contact message
   */
  async sendMessageReply(dto: SendMessageReplyDto): Promise<void> {
    const subject = `Re: ${dto.originalSubject}`;
    const text = `Dear ${dto.customerName},

Thank you for contacting SMOKE POS.

${dto.replyContent}

---
Your original message:
"${dto.originalMessage}"
---

Kind Regards,
SMOKE POS Team`;

    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${dto.to}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] Body: \n${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'),
        to: dto.to,
        subject,
        text,
      });
      this.logger.log(`Message reply sent to ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send message reply to ${dto.to}`, error);
      throw error;
    }
  }

  /**
   * Send notification to admins about a new contact message
   */
  async sendNewMessageNotification(dto: SendNewMessageNotificationDto): Promise<void> {
    if (!dto.adminEmails || dto.adminEmails.length === 0) {
      this.logger.warn('No admin emails to notify about new message');
      return;
    }

    const subject = `New Contact Message: ${dto.subject}`;
    const text = `A new contact message has been received.

From: ${dto.customerName} (${dto.customerEmail})
Subject: ${dto.subject}

Message:
${dto.message}

---
Please log in to the admin dashboard to view and respond to this message.`;

    // In development, just log to console instead of sending
    if (this.envService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV EMAIL] To: ${dto.adminEmails.join(', ')}`);
      this.logger.log(`[DEV EMAIL] Subject: ${subject}`);
      this.logger.log(`[DEV EMAIL] Body: \n${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.envService.get('MAIL_USER'),
        to: dto.adminEmails,
        subject,
        text,
      });
      this.logger.log(`New message notification sent to ${dto.adminEmails.length} admin(s)`);
    } catch (error) {
      this.logger.error(`Failed to send new message notification`, error);
    }
  }
}
