import { store, MemoryDocument } from '../../data/store';
import { DocumentStatus } from '@thevisagate/shared';
import { storageService } from '../../storage/storage.service';
import { AuditService } from '../audit-logs/audit.service';
import { config } from '../../config';
import crypto from 'crypto';
import path from 'path';

export class DocumentService {
  // Document Categories (Standard 10 Categories)
  static async listTypes() {
    return [
      { id: 'dt-1', name: 'Passport Copy', code: 'PASSPORT', isRequired: true, description: 'Clear color scan of passport bio-data and visa pages.' },
      { id: 'dt-2', name: 'NID Copy', code: 'NID', isRequired: true, description: 'National ID / Smart Card front and back scanned copy.' },
      { id: 'dt-3', name: 'Photograph', code: 'PHOTO', isRequired: true, description: 'Recent studio photograph with white background specifications.' },
      { id: 'dt-4', name: 'Educational Certificate', code: 'EDUCATION', isRequired: false, description: 'SSC, HSC, Bachelor or highest academic certificates.' },
      { id: 'dt-5', name: 'Experience Certificate', code: 'EXPERIENCE', isRequired: false, description: 'Past employment, trade experience or technical certificates.' },
      { id: 'dt-6', name: 'Medical Report', code: 'MEDICAL', isRequired: true, description: 'Authorized diagnostic center medical fitness certificate (GAMCA/FOMEMA).' },
      { id: 'dt-7', name: 'Police Clearance', code: 'POLICE_CLEARANCE', isRequired: true, description: 'Official Bangladesh Police clearance verification certificate.' },
      { id: 'dt-8', name: 'Bank Statement', code: 'BANK_STATEMENT', isRequired: false, description: 'Bank solvency certificate and 6-month transaction statement.' },
      { id: 'dt-9', name: 'Visa Application Form', code: 'VISA_FORM', isRequired: true, description: 'Filled and signed destination visa application dossier.' },
      { id: 'dt-10', name: 'Other Documents', code: 'OTHER', isRequired: false, description: 'Affidavits, marriage certificate, invitation letter, or auxiliary papers.' },
    ];
  }

  // File Security & Malware Scanning Simulation
  static scanFileSecurity(buffer: Buffer, originalName: string, mimeType: string) {
    const dangerousExts = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar', '.scr', '.pif', '.dll', '.com'];
    const ext = path.extname(originalName).toLowerCase();

    if (dangerousExts.includes(ext)) {
      throw { statusCode: 400, message: 'Security Alert: File type blocked by security policy (executable or script payload).' };
    }

    // Inspect magic bytes for disguised executable binaries
    if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
      throw { statusCode: 400, message: 'Security Alert: Executable DOS/MZ binary signature detected.' };
    }
    if (buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
      throw { statusCode: 400, message: 'Security Alert: Executable ELF header detected.' };
    }

    // Size limit verification (15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw { statusCode: 400, message: 'File size exceeds maximum permitted limit of 15MB.' };
    }

    return { clean: true, scannedAt: new Date() };
  }

  // Short-Lived Signed Access Link Generation (HMAC-SHA256)
  static generateSignedAccessToken(documentId: string, actorId: string, expiresInMinutes = 15) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    const payload = `${documentId}|${actorId}|${expiresAt}`;
    const signature = crypto.createHmac('sha256', config.jwt.secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}|${signature}`).toString('base64url');
    return {
      token,
      expiresAt,
      signedUrl: `/api/v1/documents/download-signed?token=${token}`,
    };
  }

  static verifySignedAccessToken(token: string): { documentId: string; actorId: string } {
    try {
      const raw = Buffer.from(token, 'base64url').toString('utf8');
      const parts = raw.split('|');
      if (parts.length !== 4) throw new Error('Invalid token structure');
      const [documentId, actorId, expiresAt, signature] = parts;

      const payload = `${documentId}|${actorId}|${expiresAt}`;
      const expectedSig = crypto.createHmac('sha256', config.jwt.secret).update(payload).digest('hex');

      // Constant-time comparison so a signature cannot be recovered by timing.
      const provided = Buffer.from(signature, 'utf8');
      const expected = Buffer.from(expectedSig, 'utf8');
      if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        throw new Error('Invalid signature');
      }

      if (new Date(expiresAt).getTime() < Date.now()) {
        throw new Error('Signed download link has expired');
      }

      return { documentId, actorId };
    } catch (err: any) {
      throw { statusCode: 403, message: err.message || 'Invalid or expired signed access token' };
    }
  }

  // Document Listing
  static async listByApplication(applicationId: string) {
    const docs = store.documents.filter((d) => d.applicationId === applicationId);
    return docs.map((doc) => {
      const uploader = store.users.find((u) => u.id === doc.uploadedById);
      const verifier = store.users.find((u) => u.id === doc.verifiedById);
      return {
        ...doc,
        uploaderName: uploader?.email || 'Staff Member',
        verifierName: verifier?.email || null,
      };
    });
  }

  static async listByClient(clientId: string) {
    const docs = store.documents.filter((d) => d.clientId === clientId);
    return docs.map((doc) => {
      const app = store.applications.find((a) => a.id === doc.applicationId);
      return {
        ...doc,
        applicationCode: app?.applicationCode || null,
      };
    });
  }

  // Upload Document (Admin / Staff only)
  static async uploadDocument(params: {
    applicationId?: string;
    clientId: string;
    documentTypeId: string;
    documentTypeName: string;
    fileBuffer: Buffer;
    originalName: string;
    mimeType: string;
    internalNotes?: string | null;
    verificationNotes?: string | null;
    status?: DocumentStatus;
    actorId: string;
  }) {
    let targetAppId = params.applicationId;
    if (!targetAppId) {
      const clientApp = store.applications.find((a) => a.clientId === params.clientId);
      targetAppId = clientApp ? clientApp.id : '';
    }

    // Run security and malware scanning checks
    this.scanFileSecurity(params.fileBuffer, params.originalName, params.mimeType);

    // Save with random storage key
    const saveResult = await storageService.saveFile(params.fileBuffer, params.originalName, params.mimeType);

    const initialStatus = params.status || DocumentStatus.RECEIVED;

    const newDoc: MemoryDocument = {
      id: `doc-${crypto.randomUUID()}`,
      applicationId: targetAppId || '',
      clientId: params.clientId,
      documentTypeId: params.documentTypeId,
      documentTypeName: params.documentTypeName,
      fileName: saveResult.fileName,
      originalName: params.originalName,
      storagePath: saveResult.storagePath,
      fileSize: saveResult.fileSize,
      mimeType: params.mimeType,
      status: initialStatus,
      verificationNotes: params.verificationNotes || null,
      internalNotes: params.internalNotes || null,
      verifiedById: initialStatus === DocumentStatus.VERIFIED ? params.actorId : null,
      verifiedAt: initialStatus === DocumentStatus.VERIFIED ? new Date() : null,
      uploadedById: params.actorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.documents.push(newDoc);
    store.saveToDisk();

    await AuditService.record({
      userId: params.actorId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: newDoc.id,
      details: {
        documentType: params.documentTypeName,
        fileName: params.originalName,
        fileSize: saveResult.fileSize,
        status: initialStatus,
      },
    });

    return newDoc;
  }

  // Replace Document File (Staff Action)
  static async replaceDocument(params: {
    documentId: string;
    fileBuffer: Buffer;
    originalName: string;
    mimeType: string;
    internalNotes?: string | null;
    actorId: string;
  }) {
    const doc = store.documents.find((d) => d.id === params.documentId);
    if (!doc) throw { statusCode: 404, message: 'Document not found' };

    // Security Scan
    this.scanFileSecurity(params.fileBuffer, params.originalName, params.mimeType);

    // Remove previous physical file if existing
    try {
      await storageService.deleteFile(doc.storagePath);
    } catch {
      // Ignore if file was not on disk
    }

    // Save newly uploaded replacement file
    const saveResult = await storageService.saveFile(params.fileBuffer, params.originalName, params.mimeType);

    doc.fileName = saveResult.fileName;
    doc.originalName = params.originalName;
    doc.storagePath = saveResult.storagePath;
    doc.fileSize = saveResult.fileSize;
    doc.mimeType = params.mimeType;
    doc.status = DocumentStatus.RESUBMITTED;
    doc.replacedAt = new Date();
    doc.replacedById = params.actorId;
    if (params.internalNotes !== undefined) {
      doc.internalNotes = params.internalNotes;
    }
    doc.updatedAt = new Date();
    store.saveToDisk();

    await AuditService.record({
      userId: params.actorId,
      action: 'DOCUMENT_REPLACED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      details: {
        documentType: doc.documentTypeName,
        newFileName: params.originalName,
        newFileSize: saveResult.fileSize,
      },
    });

    return doc;
  }

  // Update Status & Verification Remarks (Approve, Reject, Request Correction, etc.)
  static async updateStatus(params: {
    documentId: string;
    status: DocumentStatus;
    verificationNotes?: string | null;
    internalNotes?: string | null;
    actorId: string;
  }) {
    const doc = store.documents.find((d) => d.id === params.documentId);
    if (!doc) throw { statusCode: 404, message: 'Document not found' };

    doc.status = params.status;
    if (params.verificationNotes !== undefined) doc.verificationNotes = params.verificationNotes;
    if (params.internalNotes !== undefined) doc.internalNotes = params.internalNotes;

    if (params.status === DocumentStatus.VERIFIED) {
      doc.verifiedById = params.actorId;
      doc.verifiedAt = new Date();
    }
    doc.updatedAt = new Date();
    store.saveToDisk();

    await AuditService.record({
      userId: params.actorId,
      action: 'DOCUMENT_STATUS_UPDATED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      details: {
        status: params.status,
        verificationNotes: params.verificationNotes,
      },
    });

    return doc;
  }

  // Delete Document
  static async deleteDocument(documentId: string, actorId: string) {
    const idx = store.documents.findIndex((d) => d.id === documentId);
    if (idx === -1) throw { statusCode: 404, message: 'Document not found' };

    const doc = store.documents[idx];

    try {
      await storageService.deleteFile(doc.storagePath);
    } catch {
      // Ignore physical delete errors
    }

    store.documents.splice(idx, 1);
    store.deleteRecordFromFirebase('tvg_documents', documentId);
    store.saveToDisk();

    await AuditService.record({
      userId: actorId,
      action: 'DOCUMENT_DELETED',
      entityType: 'DOCUMENT',
      entityId: documentId,
      details: {
        documentType: doc.documentTypeName,
        fileName: doc.originalName,
      },
    });

    return true;
  }

  // Get Stream & Audit Access
  static async getFileStream(documentId: string, actorId: string, ip?: string, userAgent?: string) {
    const doc = store.documents.find((d) => d.id === documentId);
    if (!doc) throw { statusCode: 404, message: 'Document not found' };

    const stream = storageService.getFileStream(doc.storagePath);

    await AuditService.record({
      userId: actorId,
      action: 'DOCUMENT_DOWNLOADED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      details: { fileName: doc.originalName, documentType: doc.documentTypeName },
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      stream,
      mimeType: doc.mimeType,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
    };
  }

  // Get Stream via Signed Token
  static async getFileStreamByToken(token: string, ip?: string, userAgent?: string) {
    const { documentId, actorId } = this.verifySignedAccessToken(token);
    return this.getFileStream(documentId, actorId, ip, userAgent);
  }
}
