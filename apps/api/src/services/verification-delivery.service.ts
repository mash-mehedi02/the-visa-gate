import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

export interface VerificationDelivery {
  channel: 'email';
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
 * Delivers one-time verification codes to employees and password-reset
 * tokens to clients, by email only.
 *
 * There is deliberately no fallback. An earlier version parked the code
 * against the challenge token (retrievable from an unauthenticated endpoint)
 * and wrote it to the in-app notification inbox when SMTP was unconfigured,
 * which meant anyone holding the challenge token returned by the login
 * response could complete MFA without access to the registered contact.
 * Delivery now fails loudly instead: SMTP must be configured before staff
 * can sign in with MFA (see docs/setup-guide.md and SECURITY_REVIEW.md).
 *
 * The code is never returned in an API response and never written to a log.
 */
export class VerificationDeliveryService {
  static async deliverCode(
    userId: string,
    email: string | null,
    code: string,
    purpose: 'SIGN_IN' | 'PASSWORD_RESET'
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

    if (!mailer || !email) {
      throw {
        statusCode: 503,
        message:
          'Email delivery is not configured. Ask your administrator to configure SMTP before signing in.',
      };
    }

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
      console.warn('[VerificationDelivery] SMTP delivery failed.');
      throw {
        statusCode: 503,
        message: 'Email delivery failed. Please try again or contact your administrator.',
      };
    }
  }
}
