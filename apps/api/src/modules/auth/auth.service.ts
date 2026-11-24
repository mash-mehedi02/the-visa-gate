import { store, MemoryUser } from '../../data/store';
import { comparePassword, hashPassword, normalizeIdentifier, decryptSensitiveData } from '../../utils/crypto';
import { generateToken, TokenPayload } from '../../utils/jwt';
import { RoleName } from '@thevisagate/shared';
import { AuditService } from '../audit-logs/audit.service';
import { VerificationDeliveryService } from '../../services/verification-delivery.service';
import crypto from 'crypto';

export interface LoginResult {
  token?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  maskedDestination?: string;
  user?: {
    id: string;
    identifier: string;
    email: string | null;
    role: RoleName;
    name: string;
    mustChangePassword: boolean;
    clientProfile?: any;
    staffProfile?: any;
  };
}

export class AuthService {
  static async login(
    identifierRaw: string,
    passwordPlain: string,
    mfaCode?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResult> {
    const normalizedId = normalizeIdentifier(identifierRaw);

    // Find user across store
    let user = store.users.find(
      (u) =>
        u.identifier.toUpperCase() === normalizedId ||
        (u.email && u.email.toUpperCase() === normalizedId)
    );

    // If client user not found by identifier, check store.clients for matching decrypted passport
    if (!user) {
      const matchedClient = store.clients.find((c) => {
        try {
          if (c.passportEncrypted) {
            const dec = decryptSensitiveData(c.passportEncrypted).trim().toUpperCase();
            return dec === normalizedId;
          }
        } catch {}
        return false;
      });
      if (matchedClient) {
        user = store.users.find((u) => u.id === matchedClient.userId);
      }
    }

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials. Please check your passport number / email / employee ID and password.' };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: 'Your account has been deactivated. Please contact The Visa Gate administration.' };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw { statusCode: 423, message: `Account temporarily locked due to multiple failed attempts. Try again in ${waitMinutes} minutes.` };
    }

    // Password authentication check. A National ID is an identifier, never a
    // credential: it must not be accepted as a password.
    const isMatch = await comparePassword(passwordPlain, user.passwordHash);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        user.failedLoginAttempts = 0;
      }
      throw { statusCode: 401, message: 'Invalid credentials. Please check your passport number and password, or use "Forgot password?" to set a new one.' };
    }

    // MFA Check for Employee Portal (ADMIN, SUPER_ADMIN, STAFF)
    const isEmployee = user.role === RoleName.ADMIN || user.role === RoleName.SUPER_ADMIN || user.role === RoleName.STAFF;
    if (isEmployee && !mfaCode) {
      // Generate 6-digit MFA challenge
      const challengeCode = crypto.randomInt(100000, 999999).toString();
      const mfaToken = `mfa_${crypto.randomUUID()}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      store.mfaChallenges.set(mfaToken, {
        userId: user.id,
        code: challengeCode,
        expiresAt,
        attempts: 0,
      });

      // Audit log MFA initiated
      await AuditService.record({
        userId: user.id,
        action: 'MFA_CHALLENGE_ISSUED',
        entityType: 'USER',
        entityId: user.id,
        details: { role: user.role, mfaToken },
        ipAddress,
        userAgent,
      });

      // Deliver the code to the employee's registered contact. When email
      // delivery is unavailable this throws: staff sign-in must fail loudly
      // rather than fall back to a retrievable code (see SECURITY_REVIEW.md).
      const delivery = await VerificationDeliveryService.deliverCode(
        user.id,
        user.email,
        challengeCode,
        'SIGN_IN'
      );

      // Mask destination email or phone for MFA display
      let maskedDestination = delivery.destination;

      return {
        requiresMfa: true,
        mfaToken,
        maskedDestination,
      };
    }

    return this.completeLoginSession(user, ipAddress, userAgent);
  }

  static async verifyMfa(mfaToken: string, code: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    const challenge = store.mfaChallenges.get(mfaToken);
    if (!challenge) {
      throw { statusCode: 400, message: 'MFA challenge expired or invalid. Please start login again.' };
    }

    if (challenge.expiresAt < new Date()) {
      store.mfaChallenges.delete(mfaToken);
      throw { statusCode: 400, message: 'MFA code expired. Please log in again.' };
    }

    // Only the code issued for this specific challenge is accepted.
    if (code !== challenge.code) {
      challenge.attempts += 1;
      if (challenge.attempts >= 3) {
        store.mfaChallenges.delete(mfaToken);
        throw { statusCode: 401, message: 'Too many invalid MFA attempts. Please log in again.' };
      }
      throw { statusCode: 401, message: 'Invalid verification code.' };
    }

    const user = store.users.find((u) => u.id === challenge.userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    store.mfaChallenges.delete(mfaToken);
    return this.completeLoginSession(user, ipAddress, userAgent);
  }

  private static async completeLoginSession(user: MemoryUser, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();

    let clientProfile = undefined;
    let staffProfile = undefined;
    let displayName = user.identifier;

    if (user.role === RoleName.CLIENT) {
      const cli = store.clients.find((c) => c.userId === user.id);
      if (cli) {
        displayName = cli.fullName;
        clientProfile = {
          id: cli.id,
          clientCode: cli.clientCode,
          fullName: cli.fullName,
          passportMasked: cli.passportMasked,
          nidMasked: cli.nidMasked,
          dateOfBirth: cli.dateOfBirth,
          avatarUrl: cli.avatarUrl,
        };
      }
    } else if (user.role === RoleName.STAFF) {
      const stf = store.staff.find((s) => s.userId === user.id);
      if (stf) {
        displayName = stf.fullName;
        staffProfile = {
          id: stf.id,
          employeeId: stf.employeeId,
          fullName: stf.fullName,
          designation: stf.designation,
          permissions: stf.permissions,
        };
      }
    } else if (user.role === RoleName.ADMIN || user.role === RoleName.SUPER_ADMIN) {
      displayName = user.role === RoleName.SUPER_ADMIN ? 'Super Administrator' : 'System Administrator';
    }

    const sessionId = `sess_${crypto.randomUUID()}`;
    const payload: TokenPayload = {
      userId: user.id,
      identifier: user.identifier,
      role: user.role,
      name: displayName,
      clientId: clientProfile?.id,
      staffId: staffProfile?.id,
      sessionId,
    };

    const token = generateToken(payload);

    // Audit log
    await AuditService.record({
      userId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role, identifier: user.identifier, sessionId },
      ipAddress,
      userAgent,
    });

    return {
      token,
      requiresMfa: false,
      user: {
        id: user.id,
        identifier: user.identifier,
        email: user.email,
        role: user.role,
        name: displayName,
        mustChangePassword: user.mustChangePassword,
        clientProfile,
        staffProfile,
      },
    };
  }

  static async revokeSession(sessionId: string, actorId: string): Promise<void> {
    store.revokedSessions.add(sessionId);
    await AuditService.record({
      userId: actorId,
      action: 'SESSION_REVOKED',
      entityType: 'SESSION',
      entityId: sessionId,
    });
  }

  static async initiatePasswordRecovery(
    identifierRaw: string,
    phoneLastDigits?: string
  ): Promise<{ message: string }> {
    const normalizedId = normalizeIdentifier(identifierRaw);
    const user = store.users.find(
      (u) =>
        u.identifier.toUpperCase() === normalizedId ||
        (u.email && u.email.toUpperCase() === normalizedId)
    );

    // Client-facing recovery must never confirm or deny whether an account
    // exists, so the same message is returned in every case.
    const genericMessage =
      'If an account matches the details you provided, a password reset token has been sent to the contact registered on the account.';

    if (!user) {
      return { message: genericMessage };
    }

    // Employee accounts are recovered through the administrator, not a public
    // endpoint, so no reset token is ever issued here.
    if (user.role !== RoleName.CLIENT) {
      return { message: genericMessage };
    }

    // For clients the phone last-4 match is mandatory: without it the
    // identifier alone would be enough to take over the account.
    const client = store.clients.find((c) => c.userId === user.id);
    if (!client || !phoneLastDigits || !/^\d{4}$/.test(phoneLastDigits.trim())) {
      throw { statusCode: 400, message: 'Enter the last 4 digits of the phone number registered on your file.' };
    }
    if (!client.phone.endsWith(phoneLastDigits.trim())) {
      // Return the same generic message as for an unknown identifier: a
      // distinct error here would confirm that the passport number exists.
      return { message: genericMessage };
    }

    const resetToken = `pwd_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    store.passwordResetTokens.set(resetToken, {
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // The reset token is delivered out-of-band to the registered contact and
    // is never returned in the API response. If delivery is down we still
    // return the generic message (a failure here would confirm the account
    // exists); the office can help the client by phone instead.
    try {
      await VerificationDeliveryService.deliverCode(
        user.id,
        user.email,
        resetToken,
        'PASSWORD_RESET'
      );
    } catch {
      console.warn('[AUTH] Password-reset delivery failed; token issued but not delivered.');
    }

    await AuditService.record({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'USER',
      entityId: user.id,
    });

    return { message: genericMessage };
  }

  static async completePasswordRecovery(resetToken: string, newPass: string): Promise<void> {
    const record = store.passwordResetTokens.get(resetToken);
    if (!record || record.expiresAt < new Date()) {
      store.passwordResetTokens.delete(resetToken);
      throw { statusCode: 400, message: 'Invalid or expired password reset token' };
    }

    const user = store.users.find((u) => u.id === record.userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    user.passwordHash = await hashPassword(newPass);
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.updatedAt = new Date();

    store.passwordResetTokens.delete(resetToken);

    await AuditService.record({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'USER',
      entityId: user.id,
    });
  }

  static async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = store.users.find((u) => u.id === userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const isMatch = await comparePassword(currentPass, user.passwordHash);
    if (!isMatch) throw { statusCode: 400, message: 'Current password does not match' };

    user.passwordHash = await hashPassword(newPass);
    user.mustChangePassword = false;
    user.updatedAt = new Date();

    await AuditService.record({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: userId,
    });
  }

  static async getCurrentUser(userId: string) {
    const user = store.users.find((u) => u.id === userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    let clientProfile = undefined;
    let staffProfile = undefined;
    let displayName = user.identifier;

    if (user.role === RoleName.CLIENT) {
      const cli = store.clients.find((c) => c.userId === user.id);
      if (cli) {
        displayName = cli.fullName;
        clientProfile = {
          id: cli.id,
          clientCode: cli.clientCode,
          fullName: cli.fullName,
          passportMasked: cli.passportMasked,
          nidMasked: cli.nidMasked,
          dateOfBirth: cli.dateOfBirth,
          avatarUrl: cli.avatarUrl,
        };
      }
    } else if (user.role === RoleName.STAFF) {
      const stf = store.staff.find((s) => s.userId === user.id);
      if (stf) {
        displayName = stf.fullName;
        staffProfile = {
          id: stf.id,
          employeeId: stf.employeeId,
          fullName: stf.fullName,
          designation: stf.designation,
          permissions: stf.permissions,
        };
      }
    } else if (user.role === RoleName.ADMIN || user.role === RoleName.SUPER_ADMIN) {
      displayName = user.role === RoleName.SUPER_ADMIN ? 'Super Administrator' : 'System Administrator';
    }

    return {
      id: user.id,
      identifier: user.identifier,
      email: user.email,
      role: user.role,
      name: displayName,
      mustChangePassword: user.mustChangePassword,
      clientProfile,
      staffProfile,
    };
  }
}
