import { store, MemoryClient } from '../../data/store';
import { RoleName } from '@thevisagate/shared';
import { encryptSensitiveData, maskSensitiveIdentifier, normalizeIdentifier, hashPassword } from '../../utils/crypto';
import { AuditService } from '../audit-logs/audit.service';
import { FirebaseDatabaseService } from '../../services/firebase.service';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export interface CreateClientDTO {
  fullName: string;
  dateOfBirth: string;
  nidNumber: string;
  passportNumber: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  temporaryPassword?: string;
  // Referral & CRM fields
  referredByStaffId?: string | null;
  assignedProcessingStaffId?: string | null;
  clientSource?: string;
  referralDate?: string | null;
  referralNotes?: string | null;
}

export interface ListClientsQuery {
  search?: string;
  page?: number;
  limit?: number;
  referredByStaffId?: string;
  assignedStaffId?: string;
  countryId?: string;
  visaCategoryId?: string;
  clientStatus?: 'active' | 'deactivated' | 'archived';
  applicationStatus?: string;
  clientSource?: string;
  startDate?: string;
  endDate?: string;
  referralStartDate?: string;
  referralEndDate?: string;
  sortBy?: 'createdAt' | 'fullName' | 'referralDate';
  sortOrder?: 'asc' | 'desc';
}

export class ClientService {
  static async list(query: ListClientsQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const search = query.search ? query.search.trim().toLowerCase() : '';

    let filtered = store.clients.filter((c) => {
      if (query.clientStatus === 'archived') {
        return c.isArchived;
      }
      return !c.isArchived;
    });

    // Client Active / Deactivated status check
    if (query.clientStatus === 'active' || query.clientStatus === 'deactivated') {
      const activeState = query.clientStatus === 'active';
      filtered = filtered.filter((c) => {
        const u = store.users.find((user) => user.id === c.userId);
        return u ? u.isActive === activeState : true;
      });
    }

    // Referred By Staff filter
    if (query.referredByStaffId) {
      filtered = filtered.filter((c) => c.referredByStaffId === query.referredByStaffId);
    }

    // Assigned Processing Staff filter
    if (query.assignedStaffId) {
      filtered = filtered.filter((c) => c.assignedProcessingStaffId === query.assignedStaffId);
    }

    // Client Source filter
    if (query.clientSource) {
      filtered = filtered.filter((c) => c.clientSource === query.clientSource);
    }

    // Country & Visa Category & Application Status filters (checks through client applications)
    if (query.countryId || query.visaCategoryId || query.applicationStatus) {
      filtered = filtered.filter((c) => {
        const clientApps = store.applications.filter((a) => a.clientId === c.id);
        return clientApps.some((app) => {
          let match = true;
          if (query.countryId && app.countryId !== query.countryId) match = false;
          if (query.visaCategoryId && app.visaCategoryId !== query.visaCategoryId) match = false;
          if (query.applicationStatus && app.status !== query.applicationStatus) match = false;
          return match;
        });
      });
    }

    // Registration Date range filter
    if (query.startDate) {
      const start = new Date(query.startDate);
      filtered = filtered.filter((c) => new Date(c.createdAt) >= start);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      filtered = filtered.filter((c) => new Date(c.createdAt) <= end);
    }

    // Referral Date range filter
    if (query.referralStartDate) {
      filtered = filtered.filter((c) => c.referralDate && c.referralDate >= query.referralStartDate!);
    }
    if (query.referralEndDate) {
      filtered = filtered.filter((c) => c.referralDate && c.referralDate <= query.referralEndDate!);
    }

    // Search query
    if (search) {
      filtered = filtered.filter((c) => {
        return (
          c.fullName.toLowerCase().includes(search) ||
          c.clientCode.toLowerCase().includes(search) ||
          c.phone.toLowerCase().includes(search) ||
          c.passportMasked.toLowerCase().includes(search) ||
          (c.email && c.email.toLowerCase().includes(search))
        );
      });
    }

    // Sorting
    const sortField = query.sortBy || 'createdAt';
    const sortAsc = query.sortOrder === 'asc';
    filtered.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    // Return client list with enriched CRM details
    const data = paginated.map((c) => {
      const clientApps = store.applications.filter((a) => a.clientId === c.id);
      const user = store.users.find((u) => u.id === c.userId);
      const referrer = store.staff.find((s) => s.id === c.referredByStaffId);
      const assigned = store.staff.find((s) => s.id === c.assignedProcessingStaffId);

      return {
        id: c.id,
        userId: c.userId,
        clientCode: c.clientCode,
        fullName: c.fullName,
        dateOfBirth: c.dateOfBirth,
        nidMasked: c.nidMasked,
        passportMasked: c.passportMasked,
        phone: c.phone,
        email: c.email,
        address: c.address,
        avatarUrl: c.avatarUrl,
        emergencyContact: c.emergencyContact,
        isActive: user ? user.isActive : true,
        isArchived: c.isArchived,
        // Referral CRM attribution
        referredByStaffId: c.referredByStaffId,
        referredByStaffName: referrer ? referrer.fullName : null,
        assignedProcessingStaffId: c.assignedProcessingStaffId,
        assignedProcessingStaffName: assigned ? assigned.fullName : null,
        clientSource: c.clientSource,
        referralDate: c.referralDate,
        referralNotes: c.referralNotes,
        applicationsCount: clientApps.length,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return {
      clients: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(clientId: string) {
    const client = store.clients.find((c) => c.id === clientId);
    if (!client) throw { statusCode: 404, message: 'Client not found' };

    const user = store.users.find((u) => u.id === client.userId);
    const referrer = store.staff.find((s) => s.id === client.referredByStaffId);
    const assigned = store.staff.find((s) => s.id === client.assignedProcessingStaffId);

    const applications = store.applications.filter((a) => a.clientId === client.id).map((app) => {
      const country = store.countries.find((c) => c.id === app.countryId);
      const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);
      const steps = store.applicationSteps.filter((s) => s.applicationId === app.id);
      const docs = store.documents.filter((d) => d.applicationId === app.id);
      return {
        id: app.id,
        applicationCode: app.applicationCode,
        countryName: country?.name || 'Unknown',
        visaCategoryName: category?.name || 'Unknown',
        status: app.status,
        applicationDate: app.applicationDate,
        totalSteps: steps.length,
        completedSteps: steps.filter((s) => s.status === 'COMPLETED').length,
        totalDocuments: docs.length,
        verifiedDocuments: docs.filter((d) => d.status === 'VERIFIED').length,
      };
    });

    const payments = store.payments.filter((p) => p.clientId === client.id);

    return {
      client: {
        id: client.id,
        userId: client.userId,
        clientCode: client.clientCode,
        fullName: client.fullName,
        dateOfBirth: client.dateOfBirth,
        nidMasked: client.nidMasked,
        passportMasked: client.passportMasked,
        phone: client.phone,
        email: client.email,
        address: client.address,
        avatarUrl: client.avatarUrl,
        emergencyContact: client.emergencyContact,
        isActive: user ? user.isActive : true,
        isArchived: client.isArchived,
        // Referral CRM
        referredByStaffId: client.referredByStaffId,
        referredByStaffName: referrer ? referrer.fullName : null,
        assignedProcessingStaffId: client.assignedProcessingStaffId,
        assignedProcessingStaffName: assigned ? assigned.fullName : null,
        clientSource: client.clientSource,
        referralDate: client.referralDate,
        referralNotes: client.referralNotes,
        createdAt: client.createdAt ? new Date(client.createdAt).toISOString() : new Date().toISOString(),
      },
      applications,
      payments,
    };
  }

  static async create(dto: CreateClientDTO, actorId: string, ipAddress?: string) {
    const normalizedPassport = normalizeIdentifier(dto.passportNumber);

    // Prevent duplicate login identifier
    const existingUser = store.users.find(
      (u) => u.identifier.toUpperCase() === normalizedPassport
    );
    if (existingUser) {
      throw { statusCode: 409, message: `A client with passport number '${dto.passportNumber}' already exists.` };
    }

    const tempPassword = dto.temporaryPassword || `TVG@${crypto.randomInt(100000, 999999)}`;
    const passHash = await hashPassword(tempPassword);

    const userId = `usr-cli-${crypto.randomUUID()}`;
    const clientId = `cli-${crypto.randomUUID()}`;
    const clientSeq = store.clients.length + 1001;
    const clientCode = `TVG-CL-${clientSeq}`;

    // Create User record
    store.users.push({
      id: userId,
      identifier: normalizedPassport,
      email: dto.email || null,
      passwordHash: passHash,
      roleId: 'role-client',
      role: RoleName.CLIENT,
      isActive: true,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Client record
    const newClient: MemoryClient = {
      id: clientId,
      userId,
      clientCode,
      fullName: dto.fullName.trim(),
      dateOfBirth: dto.dateOfBirth,
      nidEncrypted: encryptSensitiveData(dto.nidNumber),
      nidMasked: maskSensitiveIdentifier(dto.nidNumber),
      passportEncrypted: encryptSensitiveData(dto.passportNumber),
      passportMasked: maskSensitiveIdentifier(dto.passportNumber),
      phone: dto.phone.trim(),
      email: dto.email?.trim() || null,
      address: dto.address?.trim() || null,
      avatarUrl: dto.avatarUrl || null,
      emergencyContact: dto.emergencyContact?.trim() || null,
      // Referral & CRM
      referredByStaffId: dto.referredByStaffId || null,
      assignedProcessingStaffId: dto.assignedProcessingStaffId || null,
      clientSource: dto.clientSource || 'DIRECT',
      referralDate: dto.referralDate || new Date().toISOString().split('T')[0],
      referralNotes: dto.referralNotes?.trim() || null,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.clients.push(newClient);

    // Persist immediately to disk
    store.saveToDisk();

    // Sync to Cloud Firebase Firestore
    FirebaseDatabaseService.syncClient(newClient).catch((err) => {
      console.warn('[Firebase] Background client sync failed:', err);
    });

    // Audit log
    await AuditService.record({
      userId: actorId,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: clientId,
      details: {
        clientCode,
        fullName: dto.fullName,
        passportMasked: newClient.passportMasked,
        referredByStaffId: newClient.referredByStaffId,
        assignedProcessingStaffId: newClient.assignedProcessingStaffId,
      },
      ipAddress,
    });

    return {
      client: {
        id: newClient.id,
        clientCode: newClient.clientCode,
        fullName: newClient.fullName,
        passportMasked: newClient.passportMasked,
        nidMasked: newClient.nidMasked,
        dateOfBirth: newClient.dateOfBirth,
      },
      temporaryCredentials: {
        identifier: normalizedPassport,
        temporaryPassword: tempPassword,
      },
    };
  }

  static async update(clientId: string, dto: Partial<CreateClientDTO & { isActive?: boolean; isArchived?: boolean }>, actorId: string, ipAddress?: string) {
    const client = store.clients.find((c) => c.id === clientId);
    if (!client) throw { statusCode: 404, message: 'Client not found' };

    if (dto.fullName) client.fullName = dto.fullName.trim();
    if (dto.dateOfBirth) client.dateOfBirth = dto.dateOfBirth;
    if (dto.phone) client.phone = dto.phone.trim();
    if (dto.email !== undefined) client.email = dto.email ? dto.email.trim() : null;
    if (dto.address !== undefined) client.address = dto.address ? dto.address.trim() : null;
    if (dto.avatarUrl !== undefined) client.avatarUrl = dto.avatarUrl || null;
    if (dto.emergencyContact !== undefined) client.emergencyContact = dto.emergencyContact ? dto.emergencyContact.trim() : null;
    
    // Referral updates
    if (dto.referredByStaffId !== undefined) client.referredByStaffId = dto.referredByStaffId;
    if (dto.assignedProcessingStaffId !== undefined) client.assignedProcessingStaffId = dto.assignedProcessingStaffId;
    if (dto.clientSource !== undefined) client.clientSource = dto.clientSource || client.clientSource;
    if (dto.referralDate !== undefined) client.referralDate = dto.referralDate;
    if (dto.referralNotes !== undefined) client.referralNotes = dto.referralNotes ? dto.referralNotes.trim() : null;

    if (dto.isArchived !== undefined) client.isArchived = dto.isArchived;

    // Legal Identifiers (Passport & NID) are strictly immutable after registration to guarantee tamper-proof audit trails and credential integrity.
    // client.nidEncrypted, client.nidMasked, client.passportEncrypted, and client.passportMasked remain permanently fixed.

    if (dto.isActive !== undefined) {
      const user = store.users.find((u) => u.id === client.userId);
      if (user) {
        user.isActive = dto.isActive;
      }
    }

    client.updatedAt = new Date();

    // Persist immediately to disk
    store.saveToDisk();

    // Sync updated client to Cloud Firebase Firestore
    FirebaseDatabaseService.syncClient(client).catch((err) => {
      console.warn('[Firebase] Background client sync update failed:', err);
    });

    await AuditService.record({
      userId: actorId,
      action: 'CLIENT_UPDATED',
      entityType: 'CLIENT',
      entityId: clientId,
      details: { clientCode: client.clientCode, isArchived: client.isArchived },
      ipAddress,
    });

    return client;
  }

  /**
   * Export filtered clients to CSV
   */
  static async exportToCsv(query: ListClientsQuery) {
    // Fetch all matching records without pagination limit
    const result = await this.list({ ...query, limit: 10000, page: 1 });
    const clients = result.clients;

    const headers = [
      'Client Code',
      'Full Name',
      'Passport (Masked)',
      'NID (Masked)',
      'Phone',
      'Email',
      'Client Source',
      'Referred By',
      'Assigned Processing Staff',
      'Referral Date',
      'Applications Count',
      'Status',
      'Registration Date'
    ];

    const rows = clients.map((c) => [
      `"${c.clientCode}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.passportMasked}"`,
      `"${c.nidMasked}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.clientSource || 'DIRECT'}"`,
      `"${(c.referredByStaffName || '').replace(/"/g, '""')}"`,
      `"${(c.assignedProcessingStaffName || '').replace(/"/g, '""')}"`,
      `"${c.referralDate || ''}"`,
      `"${c.applicationsCount}"`,
      `"${c.isArchived ? 'Archived' : c.isActive ? 'Active' : 'Deactivated'}"`,
      `"${c.createdAt}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Delete client (Admin only - 2-step verification)
   */
  static async deleteClient(clientId: string, actorId: string, ipAddress?: string) {
    const clientIndex = store.clients.findIndex((c) => c.id === clientId);
    if (clientIndex === -1) {
      throw { statusCode: 404, message: 'Client not found' };
    }

    const client = store.clients[clientIndex];

    // Remove user account associated with client
    const userIndex = store.users.findIndex((u) => u.id === client.userId);
    if (userIndex !== -1) {
      store.users.splice(userIndex, 1);
    }

    // Remove associated applications and steps
    const appIds = store.applications.filter((a) => a.clientId === clientId).map((a) => a.id);
    store.applications = store.applications.filter((a) => a.clientId !== clientId);
    store.applicationSteps = store.applicationSteps.filter((s) => !appIds.includes(s.applicationId));
    store.documents = store.documents.filter((d) => d.clientId !== clientId);
    store.payments = store.payments.filter((p) => p.clientId !== clientId);

    // Remove client
    store.clients.splice(clientIndex, 1);

    // Persist to disk
    store.saveToDisk();

    // Audit log
    await AuditService.record({
      userId: actorId,
      action: 'CLIENT_DELETED',
      entityType: 'CLIENT',
      entityId: clientId,
      details: {
        clientCode: client.clientCode,
        fullName: client.fullName,
        passportMasked: client.passportMasked,
      },
      ipAddress,
    });

    return { success: true, message: `Client ${client.clientCode} (${client.fullName}) permanently deleted.` };
  }

  static async updateAvatar(clientId: string, file: Express.Multer.File) {
    const client = store.clients.find((c) => c.id === clientId && !c.isArchived);
    if (!client) throw { statusCode: 404, message: 'Client not found' };

    if (!file) throw { statusCode: 400, message: 'No image file provided' };

    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    const ext = mimeToExt[file.mimetype] || '.jpg';
    const filename = `avatar-${client.id}-${Date.now()}${ext}`;
    const avatarDir = path.resolve(process.cwd(), 'uploads/avatars');

    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }

    const filePath = path.join(avatarDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;
    client.avatarUrl = avatarUrl;
    client.updatedAt = new Date();
    store.saveToDisk();

    return { avatarUrl };
  }
}
