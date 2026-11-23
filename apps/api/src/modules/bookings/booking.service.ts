import { store, MemoryBooking } from '../../data/store';
import {
  PublicBookingSchema,
  UpdateBookingStatusSchema,
  BookingStatus,
  BOOKING_TIME_SLOTS
} from '@thevisagate/shared';
import { AuditService } from '../audit-logs/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { FirebaseDatabaseService } from '../../services/firebase.service';
import crypto from 'crypto';

export class BookingService {
  /**
   * Check available slots for a given date
   * Maximum 3 appointments per slot to prevent double-booking / overcapacity
   */
  static async getAvailableSlots(date: string) {
    // Office hours: Sat - Thu (Friday is closed)
    const dayOfWeek = new Date(date).getUTCDay(); // 5 = Friday
    if (dayOfWeek === 5) {
      return {
        date,
        isHoliday: true,
        message: 'The Visa Gate office is closed on Fridays (Emergency appointments only).',
        slots: [],
      };
    }

    const maxSlotCapacity = 3;
    const existingBookings = store.bookings.filter(
      (b) =>
        (b.preferredDate === date || b.rescheduledDate === date) &&
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.REJECTED
    );

    const slots = BOOKING_TIME_SLOTS.map((timeSlot) => {
      const bookedCount = existingBookings.filter(
        (b) => (b.rescheduledTime || b.preferredTime) === timeSlot
      ).length;

      return {
        time: timeSlot,
        bookedCount,
        capacity: maxSlotCapacity,
        isAvailable: bookedCount < maxSlotCapacity,
      };
    });

    return {
      date,
      isHoliday: false,
      slots,
    };
  }

  /**
   * Submit public appointment booking request
   * Guaranteed: Does NOT automatically create a visa application
   */
  static async createBooking(data: any, ipAddress?: string) {
    const validated = PublicBookingSchema.parse(data);

    // Slot capacity & collision check (Transactional constraint simulation)
    const activeSameSlot = store.bookings.filter(
      (b) =>
        b.preferredDate === validated.preferredDate &&
        b.preferredTime === validated.preferredTime &&
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.REJECTED
    );

    if (activeSameSlot.length >= 3) {
      throw {
        statusCode: 409,
        message: `The selected time slot (${validated.preferredTime} on ${validated.preferredDate}) is fully booked. Please select another slot.`,
      };
    }

    const bookingSeq = store.bookings.length + 1001;
    const bookingCode = `TVG-BK-${bookingSeq}`;
    const id = `bk-${crypto.randomUUID()}`;

    const newBooking: MemoryBooking = {
      id,
      bookingCode,
      fullName: validated.fullName.trim(),
      phone: validated.phone.trim(),
      email: validated.email.toLowerCase().trim(),
      continent: validated.continent,
      countryId: validated.countryId,
      countryName: validated.countryName,
      programId: validated.programId || null,
      programName: validated.programName.trim(),
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      additionalMessage: validated.additionalMessage || '',
      privacyConsent: true,
      status: BookingStatus.PENDING,
      assignedStaffId: null,
      assignedStaffName: null,
      internalNotes: null,
      cancellationReason: null,
      rescheduledDate: null,
      rescheduledTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.bookings.unshift(newBooking);

    // Notify administrators
    const admins = store.users.filter((u) => u.role === 'ADMIN');
    for (const admin of admins) {
      await NotificationService.create({
        userId: admin.id,
        title: `New Consultation Booking: ${newBooking.countryName} (${newBooking.programName})`,
        message: `Client: ${newBooking.fullName} (${newBooking.phone})\nScheduled: ${newBooking.preferredDate} at ${newBooking.preferredTime}`,
        type: 'INFO',
        linkUrl: '/admin/appointments',
      });
    }

    // Record audit event
    await AuditService.record({
      action: 'CONSULTATION_BOOKING_SUBMITTED',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        bookingCode,
        fullName: newBooking.fullName,
        destination: newBooking.countryName,
        date: newBooking.preferredDate,
        time: newBooking.preferredTime,
      },
      ipAddress,
    });

    // Mirror to Firebase Firestore for real-time lead capture
    await FirebaseDatabaseService.saveInquiry({
      fullName: newBooking.fullName,
      phone: newBooking.phone,
      email: newBooking.email,
      destinationCountry: `${newBooking.countryName} (Appt: ${newBooking.preferredDate} ${newBooking.preferredTime})`,
      visaType: newBooking.programName,
      message: `Booking Code: ${bookingCode}\nNotes: ${newBooking.additionalMessage}`,
    });

    return newBooking;
  }

  /**
   * List bookings with multi-filter (Admin/Staff)
   */
  static async listBookings(query?: {
    search?: string;
    status?: string;
    countryId?: string;
    programId?: string;
    date?: string;
    staffId?: string;
  }) {
    let list = [...store.bookings];

    if (query?.status) {
      list = list.filter((b) => b.status === query.status);
    }
    if (query?.countryId) {
      list = list.filter((b) => b.countryId === query.countryId);
    }
    if (query?.programId) {
      list = list.filter((b) => b.programId === query.programId);
    }
    if (query?.date) {
      list = list.filter((b) => (b.rescheduledDate || b.preferredDate) === query.date);
    }
    if (query?.staffId) {
      list = list.filter((b) => b.assignedStaffId === query.staffId);
    }

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.fullName.toLowerCase().includes(s) ||
          b.phone.toLowerCase().includes(s) ||
          b.email.toLowerCase().includes(s) ||
          b.bookingCode.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list;
  }

  /**
   * Update booking status & manage rescheduling (Admin/Staff)
   */
  static async updateStatus(id: string, data: any, actorId: string, ipAddress?: string) {
    const validated = UpdateBookingStatusSchema.parse(data);
    const booking = store.bookings.find((b) => b.id === id);
    if (!booking) throw { statusCode: 404, message: 'Booking record not found' };

    if (validated.status) {
      booking.status = validated.status;
    }

    if (validated.assignedStaffId !== undefined) {
      booking.assignedStaffId = validated.assignedStaffId;
      const staff = store.staff.find((s) => s.id === validated.assignedStaffId);
      booking.assignedStaffName = staff ? staff.fullName : null;
    }

    if (validated.rescheduledDate) {
      booking.rescheduledDate = validated.rescheduledDate;
      booking.rescheduledTime = validated.rescheduledTime || booking.preferredTime;
      booking.status = BookingStatus.RESCHEDULED;
    }

    if (validated.internalNotes !== undefined) {
      booking.internalNotes = validated.internalNotes;
    }

    if (validated.cancellationReason !== undefined) {
      booking.cancellationReason = validated.cancellationReason;
    }

    booking.updatedAt = new Date();

    await AuditService.record({
      userId: actorId,
      action: `BOOKING_STATUS_${booking.status}`,
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        bookingCode: booking.bookingCode,
        status: booking.status,
        rescheduledDate: booking.rescheduledDate,
        assignedStaffName: booking.assignedStaffName,
      },
      ipAddress,
    });

    return booking;
  }

  /**
   * Calendar view aggregator (Daily, Weekly, Monthly)
   */
  static async getCalendar(month: string) { // YYYY-MM
    const monthBookings = store.bookings.filter(
      (b) =>
        (b.preferredDate.startsWith(month) || (b.rescheduledDate && b.rescheduledDate.startsWith(month))) &&
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.REJECTED
    );

    const dateMap: Record<string, MemoryBooking[]> = {};
    for (const b of monthBookings) {
      const d = b.rescheduledDate || b.preferredDate;
      if (!dateMap[d]) dateMap[d] = [];
      dateMap[d].push(b);
    }

    return {
      month,
      totalScheduled: monthBookings.length,
      scheduleByDate: dateMap,
    };
  }
}
