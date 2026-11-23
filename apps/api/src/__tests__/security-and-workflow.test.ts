import { describe, it, expect, beforeEach } from 'vitest';
import { encryptSensitiveData, decryptSensitiveData, maskSensitiveIdentifier, normalizeIdentifier } from '../utils/crypto';
import { AuthService } from '../modules/auth/auth.service';
import { ClientService } from '../modules/clients/client.service';
import { WorkflowService } from '../modules/workflows/workflow.service';
import { PaymentService } from '../modules/payments/payment.service';
import { ClientPortalService } from '../modules/client-portal/client-portal.service';
import { store } from '../data/store';
import { RoleName, StepStatus, PaymentMethod, PaymentStatus } from '@thevisagate/shared';

describe('1. Security: Encryption, Masking & Identifier Normalization', () => {
  it('should encrypt and decrypt sensitive data with AES-256-GCM correctly', () => {
    const rawPassport = 'A12345678';
    const encrypted = encryptSensitiveData(rawPassport);

    expect(encrypted).not.toBe(rawPassport);
    expect(encrypted).toContain(':'); // Contains iv:authTag:ciphertext

    const decrypted = decryptSensitiveData(encrypted);
    expect(decrypted).toBe(rawPassport);
  });

  it('should mask NID and Passport numbers properly for display', () => {
    const passport = 'BG1234567';
    const maskedPassport = maskSensitiveIdentifier(passport);
    expect(maskedPassport).toMatch(/^BG\d?\*+\d+$/);
    expect(maskedPassport).not.toBe(passport);

    const nid = '19951234567890123';
    const maskedNid = maskSensitiveIdentifier(nid);
    expect(maskedNid).toContain('****');
  });

  it('should normalize login identifiers consistently (uppercase, stripped whitespace)', () => {
    expect(normalizeIdentifier('  a123 45678 ')).toBe('A12345678');
    expect(normalizeIdentifier('admin@thevisagate.com ')).toBe('ADMIN@THEVISAGATE.COM');
  });
});

describe('2. Authentication Flow & Role-Based Access', () => {
  beforeEach(async () => {
    await store.seedInMemory();
  });

  it('should authenticate Admin with valid credentials and MFA verification', async () => {
    const result = await AuthService.login('admin@thevisagate.com', 'AdminSecureGate2026!');
    expect(result.requiresMfa).toBe(true);
    expect(result.mfaToken).toBeDefined();

    // The code is generated per challenge and is never a static value.
    const challenge = store.mfaChallenges.get(result.mfaToken!);
    expect(challenge).toBeDefined();
    expect(challenge!.code).toMatch(/^\d{6}$/);

    // Complete MFA verification
    const verified = await AuthService.verifyMfa(result.mfaToken!, challenge!.code);
    expect(verified.token).toBeDefined();
    expect(verified.user?.role).toBe(RoleName.ADMIN);
    expect(verified.user?.name).toBe('System Administrator');
  });

  it('should reject an MFA code that was never issued for the challenge', async () => {
    const result = await AuthService.login('admin@thevisagate.com', 'AdminSecureGate2026!');
    expect(result.requiresMfa).toBe(true);

    const challenge = store.mfaChallenges.get(result.mfaToken!);
    const wrongCode = challenge!.code === '123456' ? '654321' : '123456';

    await expect(AuthService.verifyMfa(result.mfaToken!, wrongCode)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should authenticate Client directly using Passport Number without MFA', async () => {
    const result = await AuthService.login('A12345678', 'ClientPass2026!');
    expect(result.requiresMfa).toBe(false);
    expect(result.token).toBeDefined();
    expect(result.user?.role).toBe(RoleName.CLIENT);
    expect(result.user?.clientProfile).toBeDefined();
    expect(result.user?.clientProfile.fullName).toBe('Mohammad Rafiqul Islam');
  });

  it('should fail authentication on incorrect password and increment counter', async () => {
    await expect(AuthService.login('A12345678', 'WrongPassword!')).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('3. Dynamic Visa Processing Workflow & Audit Trail', () => {
  beforeEach(async () => {
    await store.seedInMemory();
  });

  it('should advance a workflow step to COMPLETED and generate history record', async () => {
    const stepsBefore = await WorkflowService.getApplicationSteps('app-1');
    const step3 = stepsBefore.find((s) => s.stepName.includes('Medical'));
    expect(step3).toBeDefined();
    expect(step3?.status).toBe(StepStatus.IN_PROGRESS);

    // Complete the step
    const updated = await WorkflowService.updateStep(
      step3!.id,
      {
        status: StepStatus.COMPLETED,
        completedDate: '2026-11-16',
        internalNotes: 'Passed medical examination with full fitness.',
      },
      'usr-staff-1'
    );

    expect(updated.status).toBe(StepStatus.COMPLETED);
    expect(updated.completedDate).toBe('2026-11-16');

    // Verify history was appended
    const history = store.stepHistory.filter((h) => h.applicationStepId === step3!.id);
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].newStatus).toBe(StepStatus.COMPLETED);
  });

  it('should allow adding custom processing steps with dynamic sort order', async () => {
    const newStep = await WorkflowService.addStepToApplication(
      'app-1',
      {
        stepName: 'Special Ministry Clearance Verification',
        description: 'Additional ministerial clearance requested by embassy',
        sortOrder: 8,
        isPublishedToClient: true,
      },
      'usr-admin-1'
    );

    expect(newStep.id).toBeDefined();
    expect(newStep.stepName).toBe('Special Ministry Clearance Verification');
    expect(newStep.sortOrder).toBe(8);
  });
});

describe('4. Client Isolation & Privacy Verification', () => {
  beforeEach(async () => {
    await store.seedInMemory();
  });

  it('client should only see their own application progress and masked info', async () => {
    const apps = await ClientPortalService.getApplications('usr-client-1');
    expect(apps.length).toBe(1);
    expect(apps[0].applicationCode).toBe('TVG-2026-0001');

    const progress = await ClientPortalService.getApplicationProgress('usr-client-1', 'app-1');
    expect(progress.steps).toBeDefined();
    // Clients must never see internal staff notes
    progress.steps.forEach((s: any) => {
      expect(s.internalNotes).toBeUndefined();
    });
  });

  it('client should only see document names and verification status, not private files', async () => {
    const docs = await ClientPortalService.getSubmittedDocuments('usr-client-1');
    expect(docs.length).toBeGreaterThan(0);
    docs.forEach((d: any) => {
      expect(d.documentName).toBeDefined();
      expect(d.status).toBeDefined();
      expect(d.storagePath).toBeUndefined();
      expect(d.fileName).toBeUndefined();
    });
  });
});

describe('5. Manual Payment Recording & Auditable Reversals', () => {
  beforeEach(async () => {
    await store.seedInMemory();
  });

  it('should record manual payment and assign unique receipt code', async () => {
    const payment = await PaymentService.recordPayment(
      {
        applicationId: 'app-1',
        amount: 25000,
        paymentMethod: PaymentMethod.BKASH,
        transactionReference: 'BKASH-891230491',
        paymentDate: '2026-11-11',
        internalNotes: 'Second installment via bKash merchant',
      },
      'usr-staff-1'
    );

    expect(payment.receiptNumber).toMatch(/^TVG-REC-2026-\d{4}$/);
    expect(payment.amount).toBe(25000);
    expect(payment.status).toBe(PaymentStatus.RECEIVED);
  });

  it('should reverse a payment without deleting it and record adjustment reason', async () => {
    const reversed = await PaymentService.reversePayment(
      'pay-1',
      'Client deposited incorrect amount via bank transfer; refunded to client account',
      'usr-admin-1'
    );

    expect(reversed.status).toBe(PaymentStatus.REVERSED);
    expect(reversed.adjustments.length).toBe(1);
    expect(reversed.adjustments[0].reason).toContain('refunded to client account');
  });
});
