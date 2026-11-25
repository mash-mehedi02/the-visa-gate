import { store } from '../../data/store';
import { StepStatus } from '@thevisagate/shared';


export class ClientPortalService {
  static async getClientProfile(userId: string) {
    const client = store.clients.find((c) => c.userId === userId && !c.isArchived);
    if (!client) throw { statusCode: 404, message: 'Client profile not found' };

    return {
      fullName: client.fullName,
      clientCode: client.clientCode,
      dateOfBirth: client.dateOfBirth,
      nidMasked: client.nidMasked,
      passportMasked: client.passportMasked,
      phone: client.phone,
      email: client.email,
      address: client.address,
      avatarUrl: client.avatarUrl,
    };
  }

  static async getApplications(userId: string) {
    const client = store.clients.find((c) => c.userId === userId && !c.isArchived);
    if (!client) throw { statusCode: 404, message: 'Client profile not found' };

    const apps = store.applications.filter((a) => a.clientId === client.id);

    return apps.map((app) => {
      const country = store.countries.find((c) => c.id === app.countryId);
      const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);
      const steps = store.applicationSteps
        .filter((s) => s.applicationId === app.id && s.isPublishedToClient)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      // Determine next upcoming procedure
      const nextStep = steps.find((s) => s.status === StepStatus.IN_PROGRESS) ||
        steps.find((s) => s.status === StepStatus.NOT_STARTED);

      const nextProcedure = nextStep
        ? {
            stepName: nextStep.stepName,
            status: nextStep.status,
            scheduledDate: nextStep.scheduledDate,
            deadline: nextStep.deadline,
            instructions: nextStep.clientInstructions || 'Your next procedure will be updated by The Visa Gate team.',
          }
        : null;

      const totalSteps = steps.length;
      const completedSteps = steps.filter((s) => s.status === StepStatus.COMPLETED).length;
      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return {
        id: app.id,
        applicationCode: app.applicationCode,
        destinationCountry: country?.name || 'Destination Country',
        countryFlag: country?.flagEmoji || '🌐',
        visaCategory: category?.name || 'Visa Category',
        status: app.status,
        applicationDate: app.applicationDate,
        progressPercent,
        totalSteps,
        completedSteps,
        nextProcedure,
      };
    });
  }

  static async getApplicationProgress(userId: string, applicationId: string) {
    const client = store.clients.find((c) => c.userId === userId && !c.isArchived);
    if (!client) throw { statusCode: 404, message: 'Client profile not found' };

    const app = store.applications.find((a) => a.id === applicationId && a.clientId === client.id);
    if (!app) throw { statusCode: 404, message: 'Application not found or unauthorized' };

    const country = store.countries.find((c) => c.id === app.countryId);
    const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);

    // Strictly filter only steps published to client, and strip internal notes!
    const steps = store.applicationSteps
      .filter((s) => s.applicationId === app.id && s.isPublishedToClient)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        id: s.id,
        stepName: s.stepName,
        description: s.description,
        sortOrder: s.sortOrder,
        status: s.status,
        scheduledDate: s.scheduledDate,
        deadline: s.deadline,
        completedDate: s.completedDate,
        instructions: s.clientInstructions,
      }));

    const nextStep = steps.find((s) => s.status === StepStatus.IN_PROGRESS) ||
      steps.find((s) => s.status === StepStatus.NOT_STARTED);

    return {
      applicationCode: app.applicationCode,
      destinationCountry: country?.name,
      countryFlag: country?.flagEmoji,
      visaCategory: category?.name,
      status: app.status,
      applicationDate: app.applicationDate,
      steps,
      nextProcedure: nextStep || null,
    };
  }

  static async getSubmittedDocuments(userId: string, applicationId?: string) {
    const client = store.clients.find((c) => c.userId === userId && !c.isArchived);
    if (!client) throw { statusCode: 404, message: 'Client profile not found' };

    let docs = store.documents.filter((d) => d.clientId === client.id);
    if (applicationId) {
      docs = docs.filter((d) => d.applicationId === applicationId);
    }

    // Clients ONLY see document name and current verification status!
    // No private storage paths, no raw files, no internal staff notes.
    return docs.map((d) => ({
      id: d.id,
      documentName: d.documentTypeName,
      status: d.status,
      submittedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      verifiedDate: d.verifiedAt ? new Date(d.verifiedAt).toISOString().split('T')[0] : null,
    }));
  }
  // Avatar upload is intentionally NOT exposed to clients.
  // Profile photos are managed by admin/staff only via the clients module.
}
