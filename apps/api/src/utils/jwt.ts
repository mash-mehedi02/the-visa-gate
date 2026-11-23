import jwt from 'jsonwebtoken';
import { config } from '../config';
import { RoleName } from '@thevisagate/shared';

export interface TokenPayload {
  userId: string;
  identifier: string;
  role: RoleName;
  clientId?: string;
  staffId?: string;
  name?: string;
  sessionId?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}
