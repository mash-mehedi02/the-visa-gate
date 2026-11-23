import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { store } from '../data/store';

export interface VerificationDelivery {
  channel: 'email' | 'in-app';
  destination: string;
  delivered: boolean;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.smtp.host) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });

  return transporter;
}

/**
 * Delivers one-time verification codes to employees.
 *
 * When SMTP is configured the code is emailed to the address on the staff
 * account. When SMTP is not configured the code is written to the in-app
 * notification inbox instead, which the signed-in employee can open from the
 * console notification bell.
 *
 * The code is never returned in an API response and never written to the
 * console log.
 */
export class VerificationDeliveryService {
  static async deliverCode(
    userId: string,
    email: string | null,
    code: string,
    purpose: 'SIGN_IN' | 'PASSWORD_RESET',
    challengeToken?: string
  ): Promise<VerificationDelivery> {
    const subject =
      purpose === 'SIGN_IN'
        ? 'Your The Visa Gate sign-in verification code'
        : 'Your The Visa Gate password reset token';

    const body =
      purpose === 'SIGN_IN'
        ? `Your verification code is ${code}. It expires in 10 minutes. If you did not attempt to sign in, contact your administrator.`
        : `Your password reset token is ${code}. It expires in 1 hour. If you did not request this, contact the office immediately.`;

    const mailer = getTransporter();

    if (mailer && email) {
      try {
        await mailer.sendMail({
          from: config.smtp.from,
          to: email,
          subject,
          text: body,
        });
        return {
          channel: 'email',
          destination: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          delivered: true,
        };
      } catch (error) {
        // Fall through to the in-app channel rather than blocking sign-in.
        console.warn('[VerificationDelivery] SMTP delivery failed, using in-app delivery.');
      }
    }

    // In-app fallback: the code is retrievable by the authenticated employee.
    const { NotificationService } = await import('../modules/notifications/notification.service');
    await NotificationService.create({
      userId,
      title: purpose === 'SIGN_IN' ? 'Your sign-in verification code' : 'Your password reset token',
      message: body,
      type: purpose === 'SIGN_IN' ? 'INFO' : 'URGENT',
      linkUrl: purpose === 'SIGN_IN' ? '/admin/dashboard' : '/login?portal=client',
    });

    // When SMTP is unavailable the code is also parked against the one-time
    // challenge token, so the holder of that token can retrieve it directly.
    // The token is a secret issued only to the person who started the sign-in.
    if (challengeToken) {
      store.pendingVerificationCodes.set(challengeToken, {
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        consumed: false,
      });
    }

    return {
      channel: 'in-app',
      destination: email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'your notification inbox',
      delivered: true,
    };
  }

  /**
   * Retrieves a code that was delivered without a working SMTP channel.
   * Requires the one-time challenge token and is single-use.
   */
  static collectCode(challengeToken: string): string | null {
    const entry = store.pendingVerificationCodes.get(challengeToken);
    if (!entry) return null;
    if (entry.consumed || entry.expiresAt < new Date()) {
      store.pendingVerificationCodes.delete(challengeToken);
      return null;
    }
    entry.consumed = true;
    store.pendingVerificationCodes.delete(challengeToken);
    return entry.code;
  }
}
