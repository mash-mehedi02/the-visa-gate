import { store, MemoryStaff } from '../../data/store';
import { RoleName } from '@thevisagate/shared';
import { hashPassword } from '../../utils/crypto';
import { AuditService } from '../audit-logs/audit.service';
import crypto from 'crypto';

export class StaffService {
  static async list() {
    return store.staff.filter((s) => !s.isArchived).map((s) => {
      const user = store.users.find((u) => u.id === s.userId);
      const assignedApps = store.applications.filter((a) => a.assignedStaffIds.includes(s.id));
      const assignedClients = store.clients.filter((c) => c.assignedProcessingStaffId === s.id);
      const referredClients = store.clients.filter((c) => c.referredByStaffId === s.id);

      return {
        id: s.id,
        userId: s.userId,
        employeeId: s.employeeId,
        fullName: s.fullName,
        designation: s.designation,
        phone: s.phone,
        email: s.email,
        permissions: s.permissions,
        isActive: user ? user.isActive : true,
        assignedApplicationsCount: assignedApps.length,
        assignedClientsCount: assignedClients.length,
        referredClientsCount: referredClients.length,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
      };
    });
  }

  static async getById(id: string) {
    const staff = store.staff.find((s) => s.id === id);
    if (!staff) throw { statusCode: 404, message: 'Staff member not found' };

    const user = store.users.find((u) => u.id === staff.userId);
    const assignedApps = store.applications.filter((a) => a.assignedStaffIds.includes(staff.id)).map((app) => {
      const client = store.clients.find((c) => c.id === app.clientId);
      const country = store.countries.find((c) => c.id === app.countryId);
      const category = store.visaCategories.find((cat) => cat.id === app.visaCategoryId);
      return {
        id: app.id,
        applicationCode: app.applicationCode,
        clientName: client?.fullName || 'Unknown',
        countryName: country?.name || 'Unknown',
        visaCategoryName: category?.name || 'Unknown',
        status: app.status,
      };
    });

    const assignedClients = store.clients.filter((c) => c.assignedProcessingStaffId === staff.id).map((c) => ({
      id: c.id,
      clientCode: c.clientCode,
      fullName: c.fullName,
      phone: c.phone,
      passportMasked: c.passportMasked,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }));

    const referredClients = store.clients.filter((c) => c.referredByStaffId === staff.id).map((c) => {
      const clientApps = store.applications.filter((a) => a.clientId === c.id);
      const hasCompleted = clientApps.some((a) => a.status === 'COMPLETED');
      return {
        id: c.id,
        clientCode: c.clientCode,
        fullName: c.fullName,
        clientSource: c.clientSource,
        referralDate: c.referralDate,
        applicationsCount: clientApps.length,
        hasConverted: clientApps.length > 0,
        hasCompleted,
      };
    });

    // Recent activity audit logs
    const activities = store.auditLogs
      .filter((l) => l.userId === staff.userId)
      .slice(0, 30);

    return {
      staff: {
        id: staff.id,
        userId: staff.userId,
        employeeId: staff.employeeId,
        fullName: staff.fullName,
        designation: staff.designation,
        phone: staff.phone,
        email: staff.email,
        permissions: staff.permissions,
        isActive: user ? user.isActive : true,
        createdAt: staff.createdAt ? new Date(staff.createdAt).toISOString() : new Date().toISOString(),
      },
      assignedApplications: assignedApps,
      assignedClients,
      referredClients,
      activities,
    };
  }

  static async create(data: {
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    employeeId: string;
    password: string;
    permissions: string[];
  }, actorId: string, ipAddress?: string) {
    const existing = store.users.find(
      (u) => u.identifier.toUpperCase() === data.email.toUpperCase() || (u.email && u.email.toUpperCase() === data.email.toUpperCase())
    );
    if (existing) {
      throw { statusCode: 409, message: 'User with this email already exists' };
    }

    const existingEmpId = store.staff.find((s) => s.employeeId.toUpperCase() === data.employeeId.toUpperCase());
    if (existingEmpId) {
      throw { statusCode: 409, message: `Staff with employee ID '${data.employeeId}' already exists` };
    }

    const passHash = await hashPassword(data.password);
    const userId = `usr-stf-${crypto.randomUUID()}`;
    const staffId = `stf-${crypto.randomUUID()}`;

    store.users.push({
      id: userId,
      identifier: data.email.toUpperCase(),
      email: data.email.toLowerCase(),
      passwordHash: passHash,
      roleId: 'role-staff',
      role: RoleName.STAFF,
      isActive: true,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newStaff: MemoryStaff = {
      id: staffId,
      userId,
      employeeId: data.employeeId.toUpperCase(),
      fullName: data.fullName.trim(),
      designation: data.designation.trim(),
      phone: data.phone.trim(),
      email: data.email.toLowerCase(),
      permissions: data.permissions || [],
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.staff.push(newStaff);
    store.saveToDisk();

    await AuditService.record({
      userId: actorId,
      action: 'STAFF_CREATED',
      entityType: 'STAFF',
      entityId: staffId,
      details: { employeeId: newStaff.employeeId, fullName: newStaff.fullName },
      ipAddress,
    });

    return newStaff;
  }

  static async update(id: string, data: Partial<{
    fullName: string;
    phone: string;
    designation: string;
    permissions: string[];
    isActive: boolean;
  }>, actorId: string, ipAddress?: string) {
    const member = store.staff.find((s) => s.id === id);
    if (!member) throw { statusCode: 404, message: 'Staff member not found' };

    if (data.fullName) member.fullName = data.fullName.trim();
    if (data.phone) member.phone = data.phone.trim();
    if (data.designation) member.designation = data.designation.trim();
    if (data.permissions) member.permissions = data.permissions;
    member.updatedAt = new Date();
    store.saveToDisk();

    if (data.isActive !== undefined) {
      const user = store.users.find((u) => u.id === member.userId);
      if (user) user.isActive = data.isActive;
    }

    await AuditService.record({
      userId: actorId,
      action: 'STAFF_UPDATED',
      entityType: 'STAFF',
      entityId: id,
      details: { employeeId: member.employeeId, isActive: data.isActive },
      ipAddress,
    });

    return member;
  }

  /**
   * Referral CRM Analytics Report for Staff members
   */
  static async getReferralReport(query?: { staffId?: string; startDate?: string; endDate?: string }) {
    let staffMembers = store.staff.filter((s) => !s.isArchived);
    if (query?.staffId) {
      staffMembers = staffMembers.filter((s) => s.id === query.staffId);
    }

    const report = staffMembers.map((s) => {
      let referredClients = store.clients.filter((c) => c.referredByStaffId === s.id);

      if (query?.startDate) {
        referredClients = referredClients.filter((c) => c.referralDate && c.referralDate >= query.startDate!);
      }
      if (query?.endDate) {
        referredClients = referredClients.filter((c) => c.referralDate && c.referralDate <= query.endDate!);
      }

      const totalReferred = referredClients.length;

      // Applications created from these referred clients
      let convertedCount = 0;
      let completedCount = 0;
      const countryCounts: Record<string, number> = {};
      const monthlyCounts: Record<string, number> = {};

      for (const client of referredClients) {
        const apps = store.applications.filter((a) => a.clientId === client.id);
        if (apps.length > 0) {
          convertedCount++;
        }
        if (apps.some((a) => a.status === 'COMPLETED')) {
          completedCount++;
        }

        // Tally country counts
        for (const app of apps) {
          const country = store.countries.find((c) => c.id === app.countryId);
          const countryName = country?.name || 'Other';
          countryCounts[countryName] = (countryCounts[countryName] || 0) + 1;
        }

        // Tally monthly distribution
        const month = client.referralDate ? client.referralDate.substring(0, 7) : (client.createdAt ? new Date(client.createdAt).toISOString().substring(0, 7) : new Date().toISOString().substring(0, 7));
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }

      const conversionRate = totalReferred > 0 ? Number(((convertedCount / totalReferred) * 100).toFixed(1)) : 0;

      return {
        staffId: s.id,
        employeeId: s.employeeId,
        staffName: s.fullName,
        designation: s.designation,
        totalReferredClients: totalReferred,
        convertedApplications: convertedCount,
        completedApplications: completedCount,
        conversionRatePercent: conversionRate,
        countryBreakdown: countryCounts,
        monthlyBreakdown: monthlyCounts,
      };
    });

    return report;
  }
}
