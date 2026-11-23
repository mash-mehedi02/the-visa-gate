import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentService } from '../modules/documents/document.service';
import { ClientPortalService } from '../modules/client-portal/client-portal.service';
import { store } from '../data/store';
import { DocumentStatus } from '@thevisagate/shared';

describe('PROMPT 07: Document Vault & Verification System Tests', () => {
  beforeEach(async () => {
    await store.seedInMemory();
  });

  it('1. Document Categories: returns exactly 10 standard categories', async () => {
    const types = await DocumentService.listTypes();
    expect(types.length).toBe(10);

    const names = types.map((t) => t.name);
    expect(names).toEqual([
      'Passport Copy',
      'NID Copy',
      'Photograph',
      'Educational Certificate',
      'Experience Certificate',
      'Medical Report',
      'Police Clearance',
      'Bank Statement',
      'Visa Application Form',
      'Other Documents',
    ]);
  });

  it('2. Staff Upload: stores document in private vault with random storage key and internal notes', async () => {
    const samplePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const doc = await DocumentService.uploadDocument({
      applicationId: 'app-1',
      clientId: 'cli-1',
      documentTypeId: 'dt-4',
      documentTypeName: 'Educational Certificate',
      fileBuffer: samplePdf,
      originalName: 'Bachelor_Certificate_Attested.pdf',
      mimeType: 'application/pdf',
      status: DocumentStatus.RECEIVED,
      internalNotes: 'Attested by foreign affairs ministry.',
      verificationNotes: 'Pending embassy verification check.',
      actorId: 'usr-admin-1',
    });

    expect(doc.id).toBeDefined();
    expect(doc.documentTypeName).toBe('Educational Certificate');
    expect(doc.status).toBe(DocumentStatus.RECEIVED);
    expect(doc.internalNotes).toBe('Attested by foreign affairs ministry.');
    expect(doc.fileName).not.toBe('Bachelor_Certificate_Attested.pdf'); // Random storage key
    expect(doc.fileName).toMatch(/\.pdf$/);
  });

  it('3. Security & Malware Scanner: blocks executable files and disguised binary payloads', () => {
    // Dangerous extension check
    const scriptBuffer = Buffer.from('console.log("malicious")');
    expect(() => {
      DocumentService.scanFileSecurity(scriptBuffer, 'payload.exe', 'application/octet-stream');
    }).toThrow(/Security Alert/);

    // Magic bytes detection (MZ executable header disguised as .pdf)
    const mzHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]);
    expect(() => {
      DocumentService.scanFileSecurity(mzHeader, 'disguised.pdf', 'application/pdf');
    }).toThrow(/Security Alert: Executable DOS\/MZ/);

    // Oversized payload check (> 15MB)
    const oversizedBuffer = Buffer.alloc(16 * 1024 * 1024);
    expect(() => {
      DocumentService.scanFileSecurity(oversizedBuffer, 'huge.pdf', 'application/pdf');
    }).toThrow(/exceeds maximum permitted limit/);
  });

  it('4. Staff Verification Actions: Approve, Reject, and Request Correction', async () => {
    const docId = 'doc-5'; // Medical report

    // Approve
    const approved = await DocumentService.updateStatus({
      documentId: docId,
      status: DocumentStatus.VERIFIED,
      verificationNotes: 'Approved: Diagnostic report authentic and verified.',
      actorId: 'usr-admin-1',
    });
    expect(approved.status).toBe(DocumentStatus.VERIFIED);
    expect(approved.verifiedById).toBe('usr-admin-1');
    expect(approved.verifiedAt).toBeTruthy();

    // Request Correction
    const corrected = await DocumentService.updateStatus({
      documentId: docId,
      status: DocumentStatus.CORRECTION_REQUIRED,
      verificationNotes: 'Please submit clear stamped diagnostic certificate.',
      actorId: 'usr-admin-1',
    });
    expect(corrected.status).toBe(DocumentStatus.CORRECTION_REQUIRED);

    // Reject
    const rejected = await DocumentService.updateStatus({
      documentId: docId,
      status: DocumentStatus.REJECTED,
      verificationNotes: 'Failed medical fitness benchmark.',
      actorId: 'usr-admin-1',
    });
    expect(rejected.status).toBe(DocumentStatus.REJECTED);
  });

  it('5. Staff Action: Replace Document File', async () => {
    const docId = 'doc-6';
    const replacementBuffer = Buffer.from('%PDF-1.4\nUpdated bank statement content\n%%EOF');

    const replaced = await DocumentService.replaceDocument({
      documentId: docId,
      fileBuffer: replacementBuffer,
      originalName: 'EBL_Bank_Solvency_Updated_2026.pdf',
      mimeType: 'application/pdf',
      internalNotes: 'Client submitted bank certificate with branch manager signature.',
      actorId: 'usr-staff-1',
    });

    expect(replaced.originalName).toBe('EBL_Bank_Solvency_Updated_2026.pdf');
    expect(replaced.status).toBe(DocumentStatus.RESUBMITTED);
    expect(replaced.replacedAt).toBeTruthy();
    expect(replaced.replacedById).toBe('usr-staff-1');
  });

  it('6. Short-Lived Signed Access: Generates and verifies HMAC signature token', () => {
    const { token, expiresAt, signedUrl } = DocumentService.generateSignedAccessToken('doc-1', 'usr-admin-1', 15);

    expect(token).toBeDefined();
    expect(signedUrl).toContain(`/api/v1/documents/download-signed?token=${token}`);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());

    // Verify valid token
    const verified = DocumentService.verifySignedAccessToken(token);
    expect(verified.documentId).toBe('doc-1');
    expect(verified.actorId).toBe('usr-admin-1');

    // Tampered token should fail
    const tampered = token.slice(0, -4) + 'AAAA';
    expect(() => DocumentService.verifySignedAccessToken(tampered)).toThrow(/Invalid signature/);
  });

  it('7. Client Portal Isolation: Client ONLY sees document names and published statuses', async () => {
    // usr-client-1 is the userId for cli-1
    const clientDocs = await ClientPortalService.getSubmittedDocuments('usr-client-1', 'app-1');

    expect(clientDocs.length).toBeGreaterThan(0);
    for (const doc of clientDocs) {
      // Allowed public fields
      expect(doc.id).toBeDefined();
      expect(doc.documentName).toBeDefined();
      expect(doc.status).toBeDefined();

      // Prohibited confidential fields: MUST NOT be exposed
      expect((doc as any).internalNotes).toBeUndefined();
      expect((doc as any).verificationNotes).toBeUndefined();
      expect((doc as any).storagePath).toBeUndefined();
      expect((doc as any).fileName).toBeUndefined();
    }
  });

  it('8. Access Audit Logging: File streaming records DOCUMENT_DOWNLOADED in audit ledger', async () => {
    const prevAuditLength = store.auditLogs.length;

    await DocumentService.getFileStream('doc-1', 'usr-admin-1', '127.0.0.1', 'Vitest-Agent');

    const newAuditLength = store.auditLogs.length;
    expect(newAuditLength).toBeGreaterThan(prevAuditLength);

    const log = store.auditLogs.find((l) => l.action === 'DOCUMENT_DOWNLOADED');
    expect(log).toBeDefined();
    expect(log?.entityId).toBe('doc-1');
    expect(log?.userId).toBe('usr-admin-1');
  });
});
