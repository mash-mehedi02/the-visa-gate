import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { DocumentService } from './document.service';
import { UpdateDocumentStatusSchema } from '@thevisagate/shared';
import { sendSuccess, sendError } from '../../utils/response';

export class DocumentController {
  static async listTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const types = await DocumentService.listTypes();
      return sendSuccess(res, types);
    } catch (error) {
      next(error);
    }
  }

  static async listByApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const docs = await DocumentService.listByApplication(req.params.applicationId);
      return sendSuccess(res, docs);
    } catch (error) {
      next(error);
    }
  }

  static async listByClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const docs = await DocumentService.listByClient(req.params.clientId);
      return sendSuccess(res, docs);
    } catch (error) {
      next(error);
    }
  }

  static async upload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const { applicationId, clientId, documentTypeId, documentTypeName, internalNotes, verificationNotes, status } = req.body;
      if (!clientId || !documentTypeId) {
        return sendError(res, 'Missing required fields: clientId, documentTypeId', 400);
      }

      const actorId = req.user?.userId || 'system';
      const doc = await DocumentService.uploadDocument({
        applicationId,
        clientId,
        documentTypeId,
        documentTypeName: documentTypeName || 'Document',
        fileBuffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        internalNotes: internalNotes || null,
        verificationNotes: verificationNotes || null,
        status: status || undefined,
        actorId,
      });

      return sendSuccess(res, doc, 'Document stored in private vault successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async replace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No replacement file uploaded', 400);
      }

      const actorId = req.user?.userId || 'system';
      const { internalNotes } = req.body;

      const doc = await DocumentService.replaceDocument({
        documentId: req.params.id,
        fileBuffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
        actorId,
      });

      return sendSuccess(res, doc, 'Document file replaced successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateDocumentStatusSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';

      const doc = await DocumentService.updateStatus({
        documentId: req.params.id,
        status: validated.status,
        verificationNotes: validated.verificationNotes,
        internalNotes: validated.internalNotes,
        actorId,
      });

      return sendSuccess(res, doc, 'Document verification status updated');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      await DocumentService.deleteDocument(req.params.id, actorId);
      return sendSuccess(res, null, 'Document deleted from vault');
    } catch (error) {
      next(error);
    }
  }

  static async getSignedUrl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const signedAccess = DocumentService.generateSignedAccessToken(req.params.id, actorId);
      return sendSuccess(res, signedAccess);
    } catch (error) {
      next(error);
    }
  }

  static async download(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const fileData = await DocumentService.getFileStream(req.params.id, actorId, req.ip, req.headers['user-agent']);

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileData.originalName)}"`);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      fileData.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  // Public/token-gated short-lived stream
  static async downloadSigned(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        return sendError(res, 'Access token is required', 400);
      }

      const fileData = await DocumentService.getFileStreamByToken(token, req.ip, req.headers['user-agent']);

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileData.originalName)}"`);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      fileData.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
