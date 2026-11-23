import { store } from '../../data/store';
import { ApplicationStatus, StepStatus, DocumentStatus, PaymentStatus } from '@thevisagate/shared';

export class ReportService {
  static async getDashboardMetrics() {
    const totalClients = store.clients.filter((c) => !c.isArchived).length;
    const totalApplications = store.applications.length;
    const activeApplications = store.applications.filter((a) => a.status === ApplicationStatus.ACTIVE).length;
    const completedApplications = store.applications.filter((a) => a.status === ApplicationStatus.COMPLETED).length;
    const onHoldApplications = store.applications.filter((a) => a.status === ApplicationStatus.ON_HOLD).length;

    const pendingDocuments = store.documents.filter(
      (d) => d.status === DocumentStatus.NOT_SUBMITTED || d.status === DocumentStatus.CORRECTION_REQUIRED || d.status === DocumentStatus.UNDER_REVIEW
    ).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingProcedures = store.applicationSteps.filter(
      (s) => s.status === StepStatus.IN_PROGRESS || (s.scheduledDate && s.scheduledDate >= todayStr)
    ).length;

    const overdueTasks = store.applicationSteps.filter(
      (s) => s.deadline && s.deadline < todayStr && s.status !== StepStatus.COMPLETED && s.status !== StepStatus.SKIPPED
    ).length;

    const totalPaymentsReceived = store.payments
      .filter((p) => p.status === PaymentStatus.RECEIVED)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Country Breakdown
    const applicationsByCountry = store.countries.map((c) => {
      const count = store.applications.filter((a) => a.countryId === c.id).length;
      return {
        country: c.name,
        code: c.code,
        count,
      };
    });

    // Visa Category Breakdown
    const applicationsByCategory = store.visaCategories.map((vc) => {
      const count = store.applications.filter((a) => a.visaCategoryId === vc.id).length;
      return {
        category: vc.name,
        count,
      };
    });

    // Status distribution
    const statusDistribution = Object.values(ApplicationStatus).map((status) => ({
      status,
      count: store.applications.filter((a) => a.status === status).length,
    }));

    return {
      summary: {
        totalClients,
        totalApplications,
        activeApplications,
        completedApplications,
        onHoldApplications,
        pendingDocuments,
        upcomingProcedures,
        overdueTasks,
        totalPaymentsReceived,
      },
      charts: {
        applicationsByCountry,
        applicationsByCategory,
        statusDistribution,
      },
      recentApplications: store.applications.slice(-5).reverse().map((a) => {
        const client = store.clients.find((c) => c.id === a.clientId);
        const country = store.countries.find((c) => c.id === a.countryId);
        return {
          id: a.id,
          code: a.applicationCode,
          clientName: client?.fullName,
          country: country?.name,
          status: a.status,
          date: a.applicationDate,
        };
      }),
    };
  }
}
