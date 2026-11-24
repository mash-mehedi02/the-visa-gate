import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import {
  LoginSchema,
  ChangePasswordSchema,
  MfaVerifySchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@thevisagate/shared';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { config } from '../../config';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(
        validated.identifier,
        validated.password,
        validated.mfaCode,
        ip,
        userAgent
      );

      // If MFA is required for employees, return challenge without session token
      if (result.requiresMfa) {
        return sendSuccess(res, result, 'MFA code sent to your registered device/email.');
      }

      // Set secure HTTP-only cookie. The token is never returned in the
      // response body, so browser JavaScript cannot read or copy it.
      if (result.token) {
        res.cookie('token', result.token, {
          httpOnly: true,
          secure: config.cookie.secure,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      const { token: _token, ...body } = result;
      return sendSuccess(res, body, 'Login successful');
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyMfa(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = MfaVerifySchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.verifyMfa(validated.mfaToken, validated.code, ip, userAgent);

      if (result.token) {
        res.cookie('token', result.token, {
          httpOnly: true,
          secure: config.cookie.secure,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      const { token: _token, ...body } = result;
      return sendSuccess(res, body, 'MFA verification successful');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const user = await AuthService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user?.sessionId) {
      await AuthService.revokeSession(req.user.sessionId, req.user.userId);
    }
    res.clearCookie('token');
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const validated = ChangePasswordSchema.parse(req.body);
      await AuthService.changePassword(req.user.userId, validated.currentPassword, validated.newPassword);
      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = ForgotPasswordSchema.parse(req.body);
      const result = await AuthService.initiatePasswordRecovery(validated.identifier, validated.phoneLastDigits);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = ResetPasswordSchema.parse(req.body);
      await AuthService.completePasswordRecovery(validated.token, validated.newPassword);
      return sendSuccess(res, null, 'Password has been reset successfully. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }
}
