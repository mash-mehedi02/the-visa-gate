import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { WorkflowService } from './workflow.service';
import { CreateStepSchema, UpdateStepSchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';

export class WorkflowController {
  // Templates
  static async listTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const templates = await WorkflowService.listTemplates();
      return sendSuccess(res, templates);
    } catch (error) {
      next(error);
    }
  }

  static async getTemplateById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const template = await WorkflowService.getTemplateById(req.params.id);
      return sendSuccess(res, template);
    } catch (error) {
      next(error);
    }
  }

  static async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const template = await WorkflowService.createTemplate(req.body);
      return sendSuccess(res, template, 'Workflow template created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const template = await WorkflowService.updateTemplate(req.params.id, req.body);
      return sendSuccess(res, template, 'Workflow template updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await WorkflowService.deleteTemplate(req.params.id);
      return sendSuccess(res, null, 'Workflow template deleted');
    } catch (error) {
      next(error);
    }
  }

  // Application Steps
  static async getApplicationSteps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const steps = await WorkflowService.getApplicationSteps(req.params.applicationId);
      return sendSuccess(res, steps);
    } catch (error) {
      next(error);
    }
  }

  static async addStep(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateStepSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const step = await WorkflowService.addStepToApplication(req.params.applicationId, validated, actorId);
      return sendSuccess(res, step, 'Processing step added', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateStep(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateStepSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const step = await WorkflowService.updateStep(req.params.id, validated, actorId);
      return sendSuccess(res, step, 'Processing step updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteStep(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      await WorkflowService.deleteStep(req.params.id, actorId);
      return sendSuccess(res, null, 'Processing step deleted');
    } catch (error) {
      next(error);
    }
  }

  static async reorderSteps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { stepIds } = req.body;
      const actorId = req.user?.userId || 'system';
      const steps = await WorkflowService.reorderSteps(req.params.applicationId, stepIds, actorId);
      return sendSuccess(res, steps, 'Steps reordered successfully');
    } catch (error) {
      next(error);
    }
  }
}
