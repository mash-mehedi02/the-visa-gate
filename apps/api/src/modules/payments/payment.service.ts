import { store, MemoryPayment } from '../../data/store';
import { PaymentMethod, PaymentStatus } from '@thevisagate/shared';
import { AuditService } from '../audit-logs/audit.service';
import crypto from 'crypto';

export class PaymentService {
  static async list(query: { applicationId?: string; clientId?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    let filtered = store.payments;
    if (query.applicationId) filtered = filtered.filter((p) => p.applicationId === query.applicationId);
    if (query.clientId) filtered = filtered.filter((p) => p.clientId === query.clientId);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    const payments = paginated.map((p) => {
      const client = store.clients.find((c) => c.id === p.clientId);
      const app = store.applications.find((a) => a.id === p.applicationId);
      const country = app ? store.countries.find((c) => c.id === app.countryId) : undefined;
      const category = app
        ? store.visaCategories.find((cat) => cat.id === app.visaCategoryId) ||
          store.visaPrograms.find((pr) => pr.id === app.visaCategoryId)
        : undefined;
      const recorder = store.users.find((u) => u.id === p.recordedById);
      return {
        id: p.id,
        receiptNumber: p.receiptNumber,
        applicationId: p.applicationId,
        applicationCode: app?.applicationCode || 'N/A',
        countryName: country?.name || 'N/A',
        visaCategoryName: category ? ('name' in category ? category.name : (category as any).programName) : 'N/A',
        clientId: p.clientId,
        clientCode: client?.clientCode || 'N/A',
        clientName: client?.fullName || 'N/A',
        clientPhone: client?.phone || 'N/A',
        clientPassportMasked: client?.passportMasked || 'N/A',
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        transactionReference: p.transactionReference,
        paymentDate: p.paymentDate,
        status: p.status,
        internalNotes: p.internalNotes,
        recordedBy: recorder?.identifier || 'System',
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        adjustments: p.adjustments,
      };
    });

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async recordPayment(data: {
    applicationId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    paymentDate: string;
    internalNotes?: string;
  }, actorId: string) {
    const app = store.applications.find((a) => a.id === data.applicationId);
    if (!app) throw { statusCode: 404, message: 'Application not found' };

    const paymentId = `pay-${crypto.randomUUID()}`;
    const seq = store.payments.length + 1;
    const receiptNumber = `TVG-REC-2026-${seq.toString().padStart(4, '0')}`;

    const newPayment: MemoryPayment = {
      id: paymentId,
      receiptNumber,
      applicationId: data.applicationId,
      clientId: app.clientId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference?.trim() || null,
      paymentDate: data.paymentDate,
      status: PaymentStatus.RECEIVED,
      internalNotes: data.internalNotes?.trim() || null,
      recordedById: actorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      adjustments: [],
    };

    store.payments.push(newPayment);
    store.saveToDisk();

    await AuditService.record({
      userId: actorId,
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      details: { receiptNumber, amount: data.amount, method: data.paymentMethod },
    });

    return newPayment;
  }

  static async reversePayment(paymentId: string, reason: string, actorId: string) {
    const payment = store.payments.find((p) => p.id === paymentId);
    if (!payment) throw { statusCode: 404, message: 'Payment record not found' };

    if (payment.status === PaymentStatus.REVERSED) {
      throw { statusCode: 400, message: 'Payment has already been reversed' };
    }

    payment.status = PaymentStatus.REVERSED;
    payment.updatedAt = new Date();

    payment.adjustments.push({
      id: `adj-${crypto.randomUUID()}`,
      paymentId,
      adjustmentType: 'REVERSAL',
      amount: payment.amount,
      reason: reason.trim(),
      createdById: actorId,
      createdAt: new Date(),
    });
    store.saveToDisk();

    await AuditService.record({
      userId: actorId,
      action: 'PAYMENT_REVERSED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      details: { receiptNumber: payment.receiptNumber, reason },
    });

    return payment;
  }
}
