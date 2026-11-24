import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  UserCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
  Mail,
  Edit,
  ArrowRight
} from 'lucide-react';
import { BookingStatus, BOOKING_TIME_SLOTS } from '@thevisagate/shared';

export const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Bookings List State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');

  // Dropdown Lists
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Action / Detail Modals
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [actionModal, setActionModal] = useState<{
    booking: any;
    type: 'approve' | 'reject' | 'reschedule' | 'assign' | 'complete';
  } | null>(null);

  // Form Fields for Modal Actions
  const [actionStaffId, setActionStaffId] = useState('');
  const [actionRescheduledDate, setActionRescheduledDate] = useState('');
  const [actionRescheduledTime, setActionRescheduledTime] = useState<string>(BOOKING_TIME_SLOTS[0]);
  const [actionNotes, setActionNotes] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Calendar State
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [currentMonth, setCurrentMonth] = useState(currentMonthStr);
  const [calendarData, setCalendarData] = useState<{ scheduleByDate: Record<string, any[]>; totalScheduled: number }>({
    scheduleByDate: {},
    totalScheduled: 0,
  });

  const fetchAux = async () => {
    try {
      const [cRes, sRes]: any = await Promise.all([api.get('/countries'), api.get('/staff')]);
      if (cRes.data) setCountriesList(cRes.data);
      if (sRes.data) setStaffList(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (countryFilter) params.append('countryId', countryFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (staffFilter) params.append('staffId', staffFilter);

      const res: any = await api.get(`/bookings?${params.toString()}`);
      if (res.data) setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res: any = await api.get(`/bookings/calendar?month=${currentMonth}`);
      if (res.data) setCalendarData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAux();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter, countryFilter, dateFilter, staffFilter]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendar();
    }
  }, [viewMode, currentMonth]);

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    setActionSubmitting(true);
    try {
      let payload: any = {};
      if (actionModal.type === 'approve') {
        payload = { status: BookingStatus.CONFIRMED, internalNotes: actionNotes };
      } else if (actionModal.type === 'reject') {
        payload = { status: BookingStatus.REJECTED, cancellationReason: actionNotes };
      } else if (actionModal.type === 'reschedule') {
        payload = {
          status: BookingStatus.RESCHEDULED,
          rescheduledDate: actionRescheduledDate,
          rescheduledTime: actionRescheduledTime,
          internalNotes: actionNotes,
        };
      } else if (actionModal.type === 'assign') {
        payload = { assignedStaffId: actionStaffId, internalNotes: actionNotes };
      } else if (actionModal.type === 'complete') {
        payload = { status: BookingStatus.COMPLETED, internalNotes: actionNotes };
      }

      await api.patch(`/bookings/${actionModal.booking.id}`, payload);
      setActionModal(null);
      fetchBookings();
      if (viewMode === 'calendar') fetchCalendar();
      if (selectedBooking && selectedBooking.id === actionModal.booking.id) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case BookingStatus.CONFIRMED:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case BookingStatus.PENDING:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case BookingStatus.RESCHEDULED:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case BookingStatus.COMPLETED:
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case BookingStatus.REJECTED:
      case BookingStatus.CANCELLED:
      case BookingStatus.NO_SHOW:
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
            Consultation Bookings & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review public consultation requests, manage officer assignments, reschedule slots, and view the calendar.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            List Directory ({bookings.length})
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'calendar' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-brand-gold" />
            <span>Schedule Calendar</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Directory Mode */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, Phone, Code..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="">Status (All)</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="">Country (All)</option>
                  {countriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Staff Filter */}
              <div>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="">Assigned Staff (All)</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="table-scroll">
              <table className="w-full text-left border-collapse text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-brand-navy text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Booking Reference</th>
                    <th className="py-3.5 px-6">Applicant Contact</th>
                    <th className="py-3.5 px-6">Pathway Requested</th>
                    <th className="py-3.5 px-6">Scheduled Date & Slot</th>
                    <th className="py-3.5 px-6">Assigned Staff</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading booking records...
                      </td>
                    </tr>
                  ) : bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-brand-navy">
                          {b.bookingCode}
                          <span className="text-xs text-slate-400 block font-normal">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          <strong className="block text-brand-navy font-semibold">{b.fullName}</strong>
                          <span className="text-xs text-slate-500 block">{b.phone}</span>
                          <span className="text-xs text-slate-400 block">{b.email}</span>
                        </td>

                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-brand-navy block">{b.countryName}</span>
                          <span className="text-xs text-brand-gold-dark block">{b.programName}</span>
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <CalendarIcon className="w-3.5 h-3.5 text-brand-gold" />
                            <span>{b.rescheduledDate || b.preferredDate}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                            {b.rescheduledTime || b.preferredTime}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          {b.assignedStaffName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                              {b.assignedStaffName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            {b.status === BookingStatus.PENDING && (
                              <button
                                onClick={() => setActionModal({ booking: b, type: 'approve' })}
                                title="Approve Booking"
                                className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setActionModal({ booking: b, type: 'reschedule' })}
                              title="Reschedule Slot"
                              className="p-1 rounded text-blue-600 hover:bg-blue-50"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No appointments found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Calendar Mode */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-brand-navy font-serif">
                Monthly Schedule: {currentMonth}
              </h3>
              <span className="text-xs px-2.5 py-1 rounded bg-brand-gold/15 text-brand-navy font-bold">
                {calendarData.totalScheduled} Total Appointments
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Simple Month Calendar Matrix */}
          <div className="space-y-4">
            {Object.keys(calendarData.scheduleByDate).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(calendarData.scheduleByDate).map(([date, appts]: any) => (
                  <div key={date} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <strong className="text-xs font-bold text-brand-navy font-mono">{date}</strong>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-gold/20 text-brand-navy">
                        {appts.length} Booking{appts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {appts.map((a: any) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedBooking(a)}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5 cursor-pointer hover:border-brand-gold transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-brand-gold-dark">
                              {a.rescheduledTime || a.preferredTime}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${getStatusBadge(a.status)}`}>
                              {a.status}
                            </span>
                          </div>
                          <strong className="block text-brand-navy truncate">{a.fullName}</strong>
                          <span className="text-xs text-slate-400 block truncate">{a.countryName} • {a.programName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                No consultation bookings scheduled for {currentMonth}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Execution Modal (Approve, Reject, Reschedule, Assign) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-brand-navy font-serif capitalize">
                {actionModal.type} Booking ({actionModal.booking.bookingCode})
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4 text-xs">
              {actionModal.type === 'reschedule' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Date *</label>
                    <input
                      type="date"
                      required
                      value={actionRescheduledDate}
                      onChange={(e) => setActionRescheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Time Slot *</label>
                    <select
                      value={actionRescheduledTime}
                      onChange={(e) => setActionRescheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {BOOKING_TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {actionModal.type === 'assign' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Case Officer *</label>
                  <select
                    required
                    value={actionStaffId}
                    onChange={(e) => setActionStaffId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">Select Staff Member</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionModal.type === 'reject' ? 'Rejection Reason *' : 'Internal Notes / Instructions'}
                </label>
                <textarea
                  rows={3}
                  required={actionModal.type === 'reject'}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Notes recorded for team audit..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light shadow-md"
                >
                  {actionSubmitting ? 'Saving...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Side Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-brand-gold uppercase">
                  {selectedBooking.bookingCode}
                </span>
                <h3 className="text-xl font-bold text-brand-navy">{selectedBooking.fullName}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold border uppercase ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <strong className="text-brand-navy">{selectedBooking.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-700">{selectedBooking.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <strong className="text-brand-navy">{selectedBooking.countryName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Program:</span>
                  <span className="text-slate-700">{selectedBooking.programName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <strong className="text-slate-800">{selectedBooking.rescheduledDate || selectedBooking.preferredDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Slot:</span>
                  <strong className="text-brand-gold-dark">{selectedBooking.rescheduledTime || selectedBooking.preferredTime}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Officer:</span>
                  <strong className="text-brand-navy">{selectedBooking.assignedStaffName || 'Unassigned'}</strong>
                </div>
              </div>

              {selectedBooking.additionalMessage && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Applicant Inquiries / Background:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedBooking.additionalMessage}</p>
                </div>
              )}

              {selectedBooking.internalNotes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">Internal Staff Notes:</span>
                  <p className="text-amber-800 leading-relaxed">{selectedBooking.internalNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActionModal({ booking: selectedBooking, type: 'assign' })}
                  className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Assign Staff
                </button>
                <button
                  onClick={() => setActionModal({ booking: selectedBooking, type: 'reschedule' })}
                  className="py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold"
                >
                  Reschedule Slot
                </button>
                <button
                  onClick={() => setActionModal({ booking: selectedBooking, type: 'complete' })}
                  className="py-2 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => setActionModal({ booking: selectedBooking, type: 'reject' })}
                  className="py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
