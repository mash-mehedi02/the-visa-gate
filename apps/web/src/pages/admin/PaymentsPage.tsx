import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  CreditCard,
  Plus,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Receipt
} from 'lucide-react';
import { PaymentMethod, PaymentStatus, RoleName } from '@thevisagate/shared';
import { useAuth } from '../../context/AuthContext';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  // Payment reversal is admin-only on the server too; staff must not even see the button.
  const isAdmin = user?.role === RoleName.ADMIN || user?.role === RoleName.SUPER_ADMIN;
  const [payments, setPayments] = useState<any[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordModal, setRecordModal] = useState(false);
  const [reverseModal, setReverseModal] = useState<any>(null);
  const [receiptModal, setReceiptModal] = useState<any>(null);

  // Aux data
  const [applications, setApplications] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    applicationId: '',
    amount: '',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    internalNotes: '',
  });

  const [reversalReason, setReversalReason] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/payments');
      if (res.data) setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openRecordModal = async () => {
    try {
      const res: any = await api.get('/applications');
      if (res.data) setApplications(res.data);
      setRecordModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setRecordModal(false);
      setReceiptModal(res.data);
      setFormData({
        applicationId: '',
        amount: '',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        internalNotes: '',
      });
      fetchPayments();
    } catch (err: any) {
      setPageError(err.message || 'Failed to record payment');
    }
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseModal) return;

    try {
      await api.post(`/payments/${reverseModal.id}/reverse`, {
        reason: reversalReason,
      });
      setReverseModal(null);
      setReversalReason('');
      fetchPayments();
    } catch (err: any) {
      setPageError(err.message || 'Failed to reverse payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy font-serif">Payments & Receipt Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable manual transactions, receipt generation, and audited adjustments.
          </p>
        </div>

        <button
          onClick={openRecordModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold text-brand-navy font-bold text-xs hover:bg-brand-gold-light transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record New Payment</span>
        </button>
      </div>

      {pageError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError(null)}
            aria-label="Dismiss error"
            className="ml-auto text-red-500 hover:text-red-700 font-bold min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[720px]">
            <caption className="sr-only">Recorded payments and receipts</caption>
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Receipt #</th>
                <th className="py-3 px-6">Case Code</th>
                <th className="py-3 px-6">Applicant Name</th>
                <th className="py-3 px-6">Method</th>
                <th className="py-3 px-6">Amount (BDT)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading ledger...</td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-mono font-bold text-brand-navy">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      {p.applicationCode}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {p.clientName}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-brand-navy text-sm font-mono">
                      ৳{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          p.status === PaymentStatus.RECEIVED
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setReceiptModal(p)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>

                      {p.status === PaymentStatus.RECEIVED && isAdmin && (
                        <button
                          onClick={() => setReverseModal(p)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reverse</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records in ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-brand-navy font-serif">Record Manual Payment</h3>
              <button onClick={() => setRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Case File *</label>
                <select
                  required
                  value={formData.applicationId}
                  onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                >
                  <option value="">-- Choose Application Case --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationCode} • {app.clientName} ({app.countryName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-semibold"
                  >
                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                    <option value={PaymentMethod.CASH}>Cash (In-person)</option>
                    <option value={PaymentMethod.BKASH}>bKash</option>
                    <option value={PaymentMethod.NAGAD}>Nagad</option>
                    <option value={PaymentMethod.OTHER}>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref / Cheque #</label>
                  <input
                    type="text"
                    value={formData.transactionReference}
                    onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                    placeholder="e.g. EBL-TRX-10294"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Ledger Note</label>
                <textarea
                  rows={2}
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="Installment description, bank deposit slip details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordModal(false)}
                  className="px-3 py-1.5 rounded-lg border font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Viewer Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-slate-100">
            {/* Receipt header */}
            <div className="border-b-2 border-brand-navy pb-4 flex justify-between items-start">
              <div>
                <span className="text-base font-extrabold text-brand-navy tracking-wider block">
                  THE VISA GATE
                </span>
                <span className="text-[9px] tracking-widest text-brand-gold uppercase font-semibold">
                  OFFICIAL PAYMENT RECEIPT
                </span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="font-bold text-brand-navy block">
                  {receiptModal.receiptNumber}
                </span>
                <span className="text-slate-400 text-xs">
                  Date: {receiptModal.paymentDate}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Applicant Name:</span>
                <span className="font-bold text-slate-800">{receiptModal.clientName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Application Reference:</span>
                <span className="font-mono font-bold text-brand-navy">{receiptModal.applicationCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Payment Method:</span>
                <span className="font-semibold text-slate-800">{receiptModal.paymentMethod}</span>
              </div>
              {receiptModal.transactionReference && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Transaction Reference:</span>
                  <span className="font-mono text-slate-800">{receiptModal.transactionReference}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-200 text-sm">
                <span className="font-bold text-brand-navy">Total Received:</span>
                <span className="font-black text-brand-navy font-mono">৳{Number(receiptModal.amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 text-center">
              This receipt is officially registered in The Visa Gate audit ledger. System generated document.
            </div>

            <button
              onClick={() => setReceiptModal(null)}
              className="w-full py-2 rounded-lg bg-brand-navy text-white font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Reverse Payment Modal */}
      {reverseModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-brand-navy font-serif">
                Reverse Payment {reverseModal.receiptNumber}
              </h3>
              <button onClick={() => setReverseModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReverseSubmit} className="space-y-4 text-xs">
              <div className="bg-rose-50 p-3 rounded-lg text-rose-800 text-xs">
                ⚠️ Payments are immutable. Reversing this payment will maintain the record in history and create an auditable adjustment.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mandatory Reversal Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Bank transfer bounced or refund issued to applicant account..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReverseModal(null)}
                  className="px-3 py-1.5 rounded-lg border font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
