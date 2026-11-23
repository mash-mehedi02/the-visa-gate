import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ClientService } from './client.service';
import { CreateClientSchema, UpdateClientSchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';

export class ClientController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ClientService.list(req.query as any);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ClientService.getById(req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateClientSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const result = await ClientService.create(validated, actorId, req.ip);
      return sendSuccess(res, result, 'Client registered successfully with generated credentials', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateClientSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const result = await ClientService.update(req.params.id, validated, actorId, req.ip);
      return sendSuccess(res, result, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const csv = await ClientService.exportToCsv(req.query as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=the-visa-gate-clients-${new Date().toISOString().split('T')[0]}.csv`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  static async deleteClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const result = await ClientService.deleteClient(req.params.id, actorId, req.ip);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Please provide an image file' });
      const result = await ClientService.updateAvatar(req.params.id, req.file);
      return sendSuccess(res, result, 'Client avatar updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
