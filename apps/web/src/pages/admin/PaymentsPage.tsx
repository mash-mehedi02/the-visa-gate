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
  Receipt,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '@thevisagate/shared';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
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
      alert(err.message || 'Failed to record payment');
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
      alert(err.message || 'Failed to reverse payment');
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
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

                      {p.status === PaymentStatus.RECEIVED && (
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

      {/* Official Receipt & Statement Viewer Modal */}
      {receiptModal && (() => {
        const casePayments = payments
          .filter((item) => item.applicationId === receiptModal.applicationId)
          .sort((a, b) => new Date(a.paymentDate || a.createdAt).getTime() - new Date(b.paymentDate || b.createdAt).getTime());

        const totalReceived = casePayments
          .filter((item) => item.status === PaymentStatus.RECEIVED)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const totalReversed = casePayments
          .filter((item) => item.status === PaymentStatus.REVERSED)
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const handlePrintReceipt = () => {
          const rowsHtml = casePayments.map((entry) => {
            const isCurrent = entry.id === receiptModal.id;
            const isReversed = entry.status === PaymentStatus.REVERSED;
            return `
              <tr style="background:${isCurrent ? '#fffbeb' : '#ffffff'};border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px 10px;font-family:monospace;">${entry.paymentDate || ''}</td>
                <td style="padding:8px 10px;font-family:monospace;font-weight:700;color:#0f2647;">
                  ${entry.receiptNumber || ''}
                  ${isCurrent ? '<span style="margin-left:6px;padding:2px 5px;background:#0f2647;color:#d4af37;font-size:9px;border-radius:3px;">CURRENT</span>' : ''}
                </td>
                <td style="padding:8px 10px;">${entry.paymentMethod || ''}${entry.transactionReference ? ` (${entry.transactionReference})` : ''}</td>
                <td style="padding:8px 10px;">
                  <span style="padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;background:${isReversed ? '#ffe4e6' : '#d1fae5'};color:${isReversed ? '#9f1239' : '#065f46'};">${entry.status}</span>
                </td>
                <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:700;${isReversed ? 'text-decoration:line-through;color:#e11d48;' : 'color:#0f2647;'}">
                  BDT ${Number(entry.amount).toLocaleString()}
                </td>
              </tr>
            `;
          }).join('');

          const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>The Visa Gate — ${receiptModal.receiptNumber}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 12px; line-height: 1.45; }
    .header { border-bottom: 3px solid #0f2647; padding-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .brand { font-size: 22px; font-weight: 900; color: #0f2647; letter-spacing: 1px; }
    .badge { display: inline-block; background: #fef3c7; color: #0f2647; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-left: 8px; vertical-align: middle; }
    .subtitle { font-size: 10px; font-weight: 700; color: #b48a1e; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
    .tagline { font-size: 10px; color: #64748b; margin-top: 3px; }
    .rec-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; text-align: right; font-family: monospace; }
    .rec-num { font-size: 14px; font-weight: 800; color: #0f2647; }
    .grid { display: flex; justify-content: space-between; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
    .col { flex: 1; }
    .col-right { flex: 1; text-align: right; }
    .label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
    .name { font-size: 14px; font-weight: 800; color: #0f2647; margin-bottom: 4px; }
    .card { border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-bottom: 18px; }
    .card-head { background: #0f2647; color: #ffffff; padding: 8px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; }
    .card-body { padding: 12px 14px; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
    .total-row { display: flex; justify-content: space-between; padding-top: 10px; font-size: 15px; font-weight: 900; color: #0f2647; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; font-size: 11px; }
    thead th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 9px; font-weight: 800; padding: 8px 10px; text-align: left; border-bottom: 1px solid #cbd5e1; }
    tfoot td { background: #f8fafc; border-top: 2px solid #cbd5e1; padding: 9px 10px; font-weight: 800; }
    .footer { margin-top: 22px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #64748b; }
    .sig { text-align: center; width: 170px; }
    .sig-line { border-top: 1px solid #475569; margin-top: 28px; padding-top: 4px; font-weight: 700; color: #0f2647; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div><span class="brand">THE VISA GATE</span><span class="badge">Official</span></div>
      <div class="subtitle">Official Payment Receipt &amp; Account Statement</div>
      <div class="tagline">International Visa &amp; Immigration Consultancy &bull; Audit-Verified Ledger Document</div>
    </div>
    <div class="rec-box">
      <div class="rec-num">${receiptModal.receiptNumber}</div>
      <div style="font-size:10px;color:#475569;margin-top:2px;">Date: <strong>${receiptModal.paymentDate}</strong></div>
      <div style="margin-top:4px;"><span style="padding:2px 7px;border-radius:10px;font-size:9px;font-weight:700;background:${receiptModal.status === PaymentStatus.REVERSED ? '#ffe4e6' : '#d1fae5'};color:${receiptModal.status === PaymentStatus.REVERSED ? '#9f1239' : '#065f46'};">${receiptModal.status}</span></div>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="label">Applicant Details</div>
      <div class="name">${receiptModal.clientName || 'N/A'}</div>
      <div>Client Code: <strong>${receiptModal.clientCode || 'N/A'}</strong></div>
      <div>Passport No: <strong>${receiptModal.clientPassportMasked || 'N/A'}</strong></div>
      <div>Phone: ${receiptModal.clientPhone || 'N/A'}</div>
    </div>
    <div class="col-right">
      <div class="label">Application Case</div>
      <div class="name" style="font-family:monospace;">${receiptModal.applicationCode || 'N/A'}</div>
      <div>Destination: <strong>${receiptModal.countryName || 'N/A'}</strong></div>
      <div>Visa Program: <strong>${receiptModal.visaCategoryName || 'N/A'}</strong></div>
      <div>Recorded By: ${receiptModal.recordedBy || 'System'}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <span>Current Payment Transaction</span>
      <span style="color:#d4af37;font-family:monospace;">${receiptModal.receiptNumber}</span>
    </div>
    <div class="card-body">
      <div class="row"><span>Payment Method:</span><strong>${receiptModal.paymentMethod}</strong></div>
      <div class="row"><span>Transaction / Cheque Ref:</span><span style="font-family:monospace;">${receiptModal.transactionReference || '—'}</span></div>
      ${receiptModal.internalNotes ? `<div class="row"><span>Particulars / Note:</span><span>${receiptModal.internalNotes}</span></div>` : ''}
      <div class="total-row">
        <span>Amount Paid (This Receipt):</span>
        <span style="font-family:monospace;">BDT ${Number(receiptModal.amount).toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
    <strong style="font-size:11px;color:#0f2647;text-transform:uppercase;letter-spacing:0.5px;">Case Payment Statement (${casePayments.length} ${casePayments.length === 1 ? 'Entry' : 'Entries'})</strong>
    <span style="font-size:10px;color:#64748b;font-family:monospace;">Case: ${receiptModal.applicationCode}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Receipt #</th>
        <th>Method / Ref</th>
        <th>Status</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      ${totalReversed > 0 ? `<tr><td colspan="4" style="text-align:right;color:#e11d48;">Total Reversed:</td><td style="text-align:right;color:#e11d48;font-family:monospace;">-BDT ${totalReversed.toLocaleString()}</td></tr>` : ''}
      <tr>
        <td colspan="4" style="text-align:right;color:#0f2647;text-transform:uppercase;">Net Cumulative Paid (Statement Total):</td>
        <td style="text-align:right;color:#0f2647;font-family:monospace;font-size:13px;">BDT ${totalReceived.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div style="max-width:65%;">
      Officially registered in <strong>The Visa Gate</strong> audit ledger. Electronically generated &amp; valid without physical seal.<br/>
      Issued: ${new Date(receiptModal.createdAt || Date.now()).toLocaleDateString('en-GB')}
    </div>
    <div class="sig">
      <div class="sig-line">Authorized Signatory</div>
    </div>
  </div>
</body>
</html>`;

          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            setTimeout(() => {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            }, 250);
          }
        };

        return (
          <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div
              id="tvg-official-receipt"
              className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-6 max-h-[92vh] overflow-y-auto"
            >
              {/* Official Letterhead */}
              <div className="border-b-2 border-brand-navy pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-brand-navy tracking-wider">
                      THE VISA GATE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-gold/20 text-brand-navy text-[9px] font-bold uppercase tracking-widest">
                      Official
                    </span>
                  </div>
                  <p className="text-[10px] tracking-widest text-brand-gold uppercase font-bold mt-0.5">
                    Official Payment Receipt &amp; Account Statement
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    International Visa &amp; Immigration Consultancy • Audit-Verified Ledger Document
                  </p>
                </div>

                <div className="sm:text-right font-mono text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-brand-navy block text-sm">
                    {receiptModal.receiptNumber}
                  </span>
                  <span className="text-slate-500 text-[10px] block">
                    Payment Date: <strong>{receiptModal.paymentDate}</strong>
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      receiptModal.status === PaymentStatus.RECEIVED
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {receiptModal.status}
                  </span>
                </div>
              </div>

              {/* Applicant & Case Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Applicant Details
                  </p>
                  <p className="font-bold text-brand-navy text-sm">{receiptModal.clientName || 'N/A'}</p>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>Client Code: <span className="font-mono font-semibold text-slate-800">{receiptModal.clientCode || 'N/A'}</span></p>
                    <p>Passport No: <span className="font-mono font-semibold text-slate-800">{receiptModal.clientPassportMasked || 'N/A'}</span></p>
                    <p>Phone: <span className="font-mono text-slate-800">{receiptModal.clientPhone || 'N/A'}</span></p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Application Case
                  </p>
                  <p className="font-mono font-bold text-brand-navy text-sm">{receiptModal.applicationCode || 'N/A'}</p>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p>Destination: <span className="font-semibold text-slate-800">{receiptModal.countryName || 'N/A'}</span></p>
                    <p>Visa Program: <span className="font-semibold text-slate-800">{receiptModal.visaCategoryName || 'N/A'}</span></p>
                    <p>Recorded By: <span className="font-mono text-slate-700">{receiptModal.recordedBy || 'System'}</span></p>
                  </div>
                </div>
              </div>

              {/* This Receipt Breakdown */}
              <div className="rounded-xl border border-brand-navy/20 overflow-hidden">
                <div className="bg-brand-navy text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Current Payment Transaction</span>
                  <span className="font-mono text-brand-gold">{receiptModal.receiptNumber}</span>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Payment Method:</span>
                    <span className="font-bold text-slate-800">{receiptModal.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Transaction / Cheque Ref:</span>
                    <span className="font-mono text-slate-800">{receiptModal.transactionReference || '—'}</span>
                  </div>
                  {receiptModal.internalNotes && (
                    <div className="flex justify-between gap-4 py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold shrink-0">Particulars / Note:</span>
                      <span className="text-slate-700 text-right">{receiptModal.internalNotes}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="font-bold text-brand-navy">Amount Paid (This Receipt):</span>
                    <span className="text-lg font-black text-brand-navy font-mono">
                      ৳{Number(receiptModal.amount).toLocaleString()} BDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Case Payment Statement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Case Payment Statement ({casePayments.length} {casePayments.length === 1 ? 'Entry' : 'Entries'})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Case: {receiptModal.applicationCode}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Receipt #</th>
                        <th className="py-2 px-3">Method / Ref</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {casePayments.map((entry) => {
                        const isCurrent = entry.id === receiptModal.id;
                        return (
                          <tr
                            key={entry.id}
                            className={isCurrent ? 'bg-amber-50/70 font-semibold' : 'bg-white'}
                          >
                            <td className="py-2 px-3 font-mono text-slate-600">{entry.paymentDate}</td>
                            <td className="py-2 px-3 font-mono text-brand-navy">
                              {entry.receiptNumber}
                              {isCurrent && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-navy text-brand-gold text-[9px] font-bold">
                                  CURRENT
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-700">
                              {entry.paymentMethod}
                              {entry.transactionReference ? ` (${entry.transactionReference})` : ''}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  entry.status === PaymentStatus.RECEIVED
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {entry.status}
                              </span>
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-mono font-bold ${
                                entry.status === PaymentStatus.REVERSED
                                  ? 'text-rose-600 line-through'
                                  : 'text-brand-navy'
                              }`}
                            >
                              ৳{Number(entry.amount).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs">
                      {totalReversed > 0 && (
                        <tr>
                          <td colSpan={4} className="py-1.5 px-3 text-right text-rose-600 font-semibold">
                            Total Reversed:
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-600">
                            -৳{totalReversed.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right font-bold text-brand-navy uppercase">
                          Net Cumulative Paid (Statement Total):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-brand-navy text-sm">
                          ৳{totalReceived.toLocaleString()} BDT
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Official Verification Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Officially registered in <strong>The Visa Gate</strong> audit ledger. Electronically generated &amp; valid without physical seal.
                  </span>
                </div>
                <div className="sm:text-right shrink-0 font-mono text-slate-400">
                  Issued: {new Date(receiptModal.createdAt || Date.now()).toLocaleDateString('en-GB')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Official PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="px-6 py-2.5 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
