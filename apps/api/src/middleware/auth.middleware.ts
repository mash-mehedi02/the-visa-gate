import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { RoleName } from '@thevisagate/shared';
import { store } from '../data/store';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication token missing or invalid', 401, null, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);

    // Active session check / Session revocation check
    if (decoded.sessionId && store.revokedSessions.has(decoded.sessionId)) {
      return sendError(res, 'Session has been revoked. Please log in again.', 401, null, 'SESSION_REVOKED');
    }

    // Active account verification check
    const user = store.users.find((u) => u.id === decoded.userId);
    if (user && !user.isActive) {
      return sendError(res, 'Account has been deactivated. Please contact administration.', 403, null, 'ACCOUNT_DEACTIVATED');
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired session. Please log in again.', 401, null, 'TOKEN_EXPIRED');
  }
}
