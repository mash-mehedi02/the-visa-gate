import { store, MemoryWorkflowTemplate, MemoryApplicationStep, MemoryStepHistory } from '../../data/store';
import { StepStatus } from '@thevisagate/shared';
import { AuditService } from '../audit-logs/audit.service';
import { NotificationService } from '../notifications/notification.service';
import crypto from 'crypto';

export class WorkflowService {
  // Workflow Templates
  /** Total estimated duration of a template = sum of all step durations (in days). */
  private static sumEstimatedDays(steps: { estimatedDays?: number }[]): number {
    return (steps || []).reduce((total, s) => total + (Number(s.estimatedDays) || 0), 0);
  }

  private static presentTemplate(t: MemoryWorkflowTemplate) {
    const country = store.countries.find((c) => c.id === t.countryId);
    const category = store.visaCategories.find((cat) => cat.id === t.visaCategoryId);
    return {
      ...t,
      countryName: country?.name,
      visaCategoryName: category?.name,
      totalSteps: t.steps.length,
      totalDays: this.sumEstimatedDays(t.steps),
    };
  }

  static async listTemplates() {
    return store.workflowTemplates.map((t) => this.presentTemplate(t));
  }

  static async getTemplateById(id: string) {
    const t = store.workflowTemplates.find((wf) => wf.id === id);
    if (!t) throw { statusCode: 404, message: 'Workflow template not found' };
    return this.presentTemplate(t);
  }

  static async createTemplate(data: {
    name: string;
    description: string;
    countryId?: string;
    visaCategoryId?: string;
    steps: {
      stepName: string;
      description?: string;
      sortOrder: number;
      estimatedDays?: number;
      clientInstructions?: string;
    }[];
  }) {
    const newTemplate: MemoryWorkflowTemplate = {
      id: `wf-${crypto.randomUUID()}`,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      countryId: data.countryId || null,
      visaCategoryId: data.visaCategoryId || null,
      isActive: true,
      steps: (data.steps || []).map((s, idx) => ({
        id: `ws-${crypto.randomUUID()}`,
        stepName: s.stepName.trim(),
        description: s.description?.trim() || '',
        sortOrder: s.sortOrder || idx + 1,
        estimatedDays: s.estimatedDays || 7,
        clientInstructions: s.clientInstructions?.trim() || '',
      })),
    };

    store.workflowTemplates.push(newTemplate);
    store.saveToDisk();
    return this.presentTemplate(newTemplate);
  }

  static async updateTemplate(id: string, data: {
    name?: string;
    description?: string;
    countryId?: string | null;
    visaCategoryId?: string | null;
    isActive?: boolean;
    steps?: {
      id?: string;
      stepName: string;
      description?: string;
      sortOrder: number;
      estimatedDays?: number;
      clientInstructions?: string;
    }[];
  }) {
    const t = store.workflowTemplates.find((wf) => wf.id === id);
    if (!t) throw { statusCode: 404, message: 'Workflow template not found' };

    if (data.name) t.name = data.name.trim();
    if (data.description !== undefined) t.description = data.description.trim();
    if (data.countryId !== undefined) t.countryId = data.countryId;
    if (data.visaCategoryId !== undefined) t.visaCategoryId = data.visaCategoryId;
    if (data.isActive !== undefined) t.isActive = data.isActive;

    if (data.steps) {
      t.steps = data.steps.map((s, idx) => ({
        id: s.id || `ws-${crypto.randomUUID()}`,
        stepName: s.stepName.trim(),
        description: s.description?.trim() || '',
        sortOrder: s.sortOrder || idx + 1,
        estimatedDays: s.estimatedDays || 7,
        clientInstructions: s.clientInstructions?.trim() || '',
      }));
    }

    store.saveToDisk();
    return this.presentTemplate(t);
  }

  static async deleteTemplate(id: string) {
    const idx = store.workflowTemplates.findIndex((wf) => wf.id === id);
    if (idx === -1) throw { statusCode: 404, message: 'Workflow template not found' };
    store.workflowTemplates.splice(idx, 1);
    store.saveToDisk();
    return true;
  }

  // Application Dynamic Steps
  static async getApplicationSteps(applicationId: string) {
    const steps = store.applicationSteps
      .filter((s) => s.applicationId === applicationId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return steps.map((s) => {
      const staff = store.staff.find((st) => st.id === s.assignedStaffId);
      const history = store.stepHistory.filter((h) => h.applicationStepId === s.id);
      return {
        ...s,
        assignedStaffName: staff?.fullName || s.assignedStaffName || 'Unassigned',
        history,
      };
    });
  }

  static async addStepToApplication(applicationId: string, data: {
    stepName: string;
    description?: string | null;
    sortOrder?: number;
    scheduledDate?: string | null;
    deadline?: string | null;
    assignedStaffId?: string | null;
    clientInstructions?: string | null;
    internalNotes?: string | null;
    isPublishedToClient?: boolean;
  }, actorId: string) {
    const app = store.applications.find((a) => a.id === applicationId);
    if (!app) throw { statusCode: 404, message: 'Application not found' };

    const existingSteps = store.applicationSteps.filter((s) => s.applicationId === applicationId);
    const sortOrder = data.sortOrder || (existingSteps.length + 1);

    const newStep: MemoryApplicationStep = {
      id: `as-${crypto.randomUUID()}`,
      applicationId,
      stepName: data.stepName.trim(),
      description: (data.description ?? '').trim(),
      sortOrder,
      status: StepStatus.NOT_STARTED,
      scheduledDate: data.scheduledDate || null,
      deadline: data.deadline || null,
      completedDate: null,
      assignedStaffId: data.assignedStaffId || null,
      clientInstructions: data.clientInstructions || null,
      internalNotes: data.internalNotes || null,
      isPublishedToClient: data.isPublishedToClient ?? true,
      completedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.applicationSteps.push(newStep);

    await AuditService.record({
      userId: actorId,
      action: 'STEP_ADDED',
      entityType: 'APPLICATION_STEP',
      entityId: newStep.id,
      details: { applicationId, stepName: newStep.stepName, sortOrder },
    });

    return newStep;
  }

  static async updateStep(stepId: string, data: {
    stepName?: string;
    description?: string | null;
    sortOrder?: number;
    status?: StepStatus;
    scheduledDate?: string | null;
    deadline?: string | null;
    completedDate?: string | null;
    assignedStaffId?: string | null;
    clientInstructions?: string | null;
    internalNotes?: string | null;
    isPublishedToClient?: boolean;
  }, actorId: string) {
    const step = store.applicationSteps.find((s) => s.id === stepId);
    if (!step) throw { statusCode: 404, message: 'Step not found' };

    const previousStatus = step.status;

    if (data.stepName) step.stepName = data.stepName.trim();
    if (data.description !== undefined) step.description = (data.description ?? '').trim();
    if (data.sortOrder !== undefined) step.sortOrder = data.sortOrder;
    if (data.scheduledDate !== undefined) step.scheduledDate = data.scheduledDate;
    if (data.deadline !== undefined) step.deadline = data.deadline;
    if (data.assignedStaffId !== undefined) step.assignedStaffId = data.assignedStaffId;
    if (data.clientInstructions !== undefined) step.clientInstructions = data.clientInstructions;
    if (data.internalNotes !== undefined) step.internalNotes = data.internalNotes;
    if (data.isPublishedToClient !== undefined) step.isPublishedToClient = data.isPublishedToClient;

    if (data.status && data.status !== previousStatus) {
      step.status = data.status;
      if (data.status === StepStatus.COMPLETED) {
        step.completedDate = data.completedDate || new Date().toISOString().split('T')[0];
        step.completedById = actorId;
      }

      // Record in Step History
      const historyItem: MemoryStepHistory = {
        id: `sh-${crypto.randomUUID()}`,
        applicationStepId: step.id,
        previousStatus,
        newStatus: data.status,
        changedById: actorId,
        changeNotes: data.internalNotes || null,
        createdAt: new Date(),
      };
      store.stepHistory.push(historyItem);

      // Notify Client if published
      if (step.isPublishedToClient) {
        const app = store.applications.find((a) => a.id === step.applicationId);
        if (app) {
          const client = store.clients.find((c) => c.id === app.clientId);
          if (client) {
            await NotificationService.create({
              userId: client.userId,
              title: `Step Updated: ${step.stepName}`,
              message: `Your visa processing step '${step.stepName}' has been updated to status: ${data.status.replace('_', ' ')}.`,
              type: data.status === StepStatus.COMPLETED ? 'SUCCESS' : 'INFO',
              linkUrl: '/client/portal',
            });
          }
        }
      }
    }

    step.updatedAt = new Date();

    await AuditService.record({
      userId: actorId,
      action: 'STEP_UPDATED',
      entityType: 'APPLICATION_STEP',
      entityId: step.id,
      details: { stepName: step.stepName, newStatus: step.status, previousStatus },
    });

    return step;
  }

  static async reorderSteps(applicationId: string, orderedStepIds: string[], actorId: string) {
    orderedStepIds.forEach((id, index) => {
      const step = store.applicationSteps.find((s) => s.id === id && s.applicationId === applicationId);
      if (step) {
        step.sortOrder = index + 1;
        step.updatedAt = new Date();
      }
    });

    await AuditService.record({
      userId: actorId,
      action: 'STEPS_REORDERED',
      entityType: 'APPLICATION',
      entityId: applicationId,
      details: { orderedStepIds },
    });

    return this.getApplicationSteps(applicationId);
  }

  static async deleteStep(stepId: string, actorId: string) {
    const idx = store.applicationSteps.findIndex((s) => s.id === stepId);
    if (idx === -1) throw { statusCode: 404, message: 'Step not found' };
    const step = store.applicationSteps[idx];
    store.applicationSteps.splice(idx, 1);
    store.stepHistory = store.stepHistory.filter((h) => h.applicationStepId !== stepId);

    await AuditService.record({
      userId: actorId,
      action: 'STEP_DELETED',
      entityType: 'APPLICATION_STEP',
      entityId: stepId,
      details: { applicationId: step.applicationId, stepName: step.stepName },
    });

    return true;
  }
}
