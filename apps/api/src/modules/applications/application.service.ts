import { store, MemoryApplication } from '../../data/store';
import { ApplicationStatus, StepStatus } from '@thevisagate/shared';
import { AuditService } from '../audit-logs/audit.service';
import crypto from 'crypto';

export interface ListApplicationsQuery {
  search?: string;
  countryId?: string;
  visaCategoryId?: string;
  status?: ApplicationStatus;
  staffId?: string;
  page?: number;
  limit?: number;
}

export class ApplicationService {
  static async list(query: ListApplicationsQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const search = query.search ? query.search.trim().toLowerCase() : '';

    let filtered = store.applications;

    if (query.countryId) filtered = filtered.filter((a) => a.countryId === query.countryId);
    if (query.visaCategoryId) filtered = filtered.filter((a) => a.visaCategoryId === query.visaCategoryId);
    if (query.status) filtered = filtered.filter((a) => a.status === query.status);
    if (query.staffId) filtered = filtered.filter((a) => a.assignedStaffIds.includes(query.staffId!));

    if (search) {
      filtered = filtered.filter((a) => {
        const client = store.clients.find((c) => c.id === a.clientId);
        return (
          a.applicationCode.toLowerCase().includes(search) ||
          (client && (
            client.fullName.toLowerCase().includes(search) ||
            client.clientCode.toLowerCase().includes(search) ||
            client.phone.includes(search)
          ))
        );
      });
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    const applications = paginated.map((app) => {
      const client = store.clients.find((c) => c.id === app.clientId);
      const country = store.countries.find((c) => c.id === app.countryId);
      const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);
      const steps = store.applicationSteps.filter((s) => s.applicationId === app.id).sort((a, b) => a.sortOrder - b.sortOrder);
      const docs = store.documents.filter((d) => d.applicationId === app.id);
      const assignedStaff = store.staff.filter((s) => app.assignedStaffIds.includes(s.id)).map((s) => ({
        id: s.id,
        name: s.fullName,
      }));

      const activeStep = steps.find((s) => s.status === StepStatus.IN_PROGRESS) || steps.find((s) => s.status === StepStatus.NOT_STARTED);

      return {
        id: app.id,
        applicationCode: app.applicationCode,
        clientId: app.clientId,
        clientName: client?.fullName || 'Unknown Client',
        clientCode: client?.clientCode || '',
        clientPassportMasked: client?.passportMasked || '',
        clientPhone: client?.phone || '',
        countryId: app.countryId,
        countryName: country?.name || 'Unknown Country',
        visaCategoryId: app.visaCategoryId,
        visaCategoryName: category?.name || 'Unknown Category',
        status: app.status,
        applicationDate: app.applicationDate,
        assignedStaff,
        totalSteps: steps.length,
        completedSteps: steps.filter((s) => s.status === StepStatus.COMPLETED).length,
        currentStep: activeStep ? activeStep.stepName : 'Completed',
        totalDocuments: docs.length,
        verifiedDocuments: docs.filter((d) => d.status === 'VERIFIED').length,
        createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string) {
    const app = store.applications.find((a) => a.id === id);
    if (!app) throw { statusCode: 404, message: 'Application not found' };

    const client = store.clients.find((c) => c.id === app.clientId);
    const country = store.countries.find((c) => c.id === app.countryId);
    const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);
    const steps = store.applicationSteps.filter((s) => s.applicationId === app.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const documents = store.documents.filter((d) => d.applicationId === app.id);
    const payments = store.payments.filter((p) => p.applicationId === app.id);
    const assignedStaff = store.staff.filter((s) => app.assignedStaffIds.includes(s.id)).map((s) => ({
      id: s.id,
      fullName: s.fullName,
      employeeId: s.employeeId,
      designation: s.designation,
    }));

    return {
      id: app.id,
      applicationCode: app.applicationCode,
      status: app.status,
      applicationDate: app.applicationDate,
      internalNotes: app.internalNotes,
      client: {
        id: client?.id,
        fullName: client?.fullName,
        clientCode: client?.clientCode,
        passportMasked: client?.passportMasked,
        nidMasked: client?.nidMasked,
        dateOfBirth: client?.dateOfBirth,
        phone: client?.phone,
        email: client?.email,
      },
      country: {
        id: country?.id,
        name: country?.name,
        code: country?.code,
        flagEmoji: country?.flagEmoji,
      },
      visaCategory: {
        id: category?.id,
        name: category?.name,
        code: category?.code,
      },
      assignedStaff,
      steps: steps.map((s) => ({
        id: s.id,
        stepName: s.stepName,
        description: s.description,
        sortOrder: s.sortOrder,
        status: s.status,
        scheduledDate: s.scheduledDate,
        deadline: s.deadline,
        completedDate: s.completedDate,
        clientInstructions: s.clientInstructions,
        internalNotes: s.internalNotes,
        isPublishedToClient: s.isPublishedToClient,
      })),
      documents,
      payments,
    };
  }

  static async create(data: {
    applicationCode?: string;
    clientId: string;
    countryId: string;
    visaCategoryId: string;
    workflowTemplateId?: string | null;
    assignedStaffIds?: string[];
    applicationDate?: string;
    status?: ApplicationStatus;
    internalNotes?: string | null;
  }, actorId: string) {
    const client = store.clients.find((c) => c.id === data.clientId);
    if (!client) throw { statusCode: 404, message: 'Client not found' };

    const country = store.countries.find((c) => c.id === data.countryId);
    if (!country) throw { statusCode: 404, message: 'Country not found' };

    const category = store.visaCategories.find((cat) => cat.id === data.visaCategoryId) ||
      store.visaPrograms.find((p) => p.id === data.visaCategoryId);
    if (!category) throw { statusCode: 404, message: 'Visa category or program not found' };

    const appId = `app-${crypto.randomUUID()}`;
    const seq = store.applications.length + 1001;
    const applicationCode = data.applicationCode?.trim() || `TVG-2026-${seq.toString().padStart(4, '0')}`;

    const newApp: MemoryApplication = {
      id: appId,
      applicationCode,
      clientId: data.clientId,
      countryId: data.countryId,
      visaCategoryId: data.visaCategoryId,
      status: data.status || ApplicationStatus.ACTIVE,
      applicationDate: data.applicationDate || new Date().toISOString().split('T')[0],
      internalNotes: data.internalNotes?.trim() || null,
      createdById: actorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedStaffIds: data.assignedStaffIds || [],
    };

    store.applications.push(newApp);

    // Persist immediately to disk
    store.saveToDisk();

    // Apply workflow template if selected
    if (data.workflowTemplateId) {
      const template = store.workflowTemplates.find((t) => t.id === data.workflowTemplateId);
      if (template) {
        template.steps.forEach((s, idx) => {
          store.applicationSteps.push({
            id: `as-${crypto.randomUUID()}`,
            applicationId: appId,
            stepName: s.stepName,
            description: s.description,
            sortOrder: s.sortOrder || idx + 1,
            status: idx === 0 ? StepStatus.IN_PROGRESS : StepStatus.NOT_STARTED,
            scheduledDate: null,
            deadline: null,
            completedDate: null,
            assignedStaffId: (data.assignedStaffIds && data.assignedStaffIds[0]) || null,
            clientInstructions: s.clientInstructions || null,
            internalNotes: null,
            isPublishedToClient: true,
            completedById: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    }

    await AuditService.record({
      userId: actorId,
      action: 'APPLICATION_CREATED',
      entityType: 'APPLICATION',
      entityId: appId,
      details: { applicationCode, country: country.name, category: 'name' in category ? category.name : (category as any).programName || 'Unknown' },
    });

    return newApp;
  }

  static async update(id: string, data: {
    applicationCode?: string;
    countryId?: string;
    visaCategoryId?: string;
    status?: ApplicationStatus;
    assignedStaffIds?: string[];
    applicationDate?: string;
    internalNotes?: string | null;
  }, actorId: string) {
    const app = store.applications.find((a) => a.id === id);
    if (!app) throw { statusCode: 404, message: 'Application not found' };

    if (data.applicationCode) app.applicationCode = data.applicationCode.trim();
    if (data.countryId) app.countryId = data.countryId;
    if (data.visaCategoryId) app.visaCategoryId = data.visaCategoryId;
    if (data.status) app.status = data.status;
    if (data.assignedStaffIds) app.assignedStaffIds = data.assignedStaffIds;
    if (data.applicationDate) app.applicationDate = data.applicationDate;
    if (data.internalNotes !== undefined) app.internalNotes = data.internalNotes;
    app.updatedAt = new Date();

    await AuditService.record({
      userId: actorId,
      action: 'APPLICATION_UPDATED',
      entityType: 'APPLICATION',
      entityId: id,
      details: { status: app.status },
    });

    return app;
  }
}
