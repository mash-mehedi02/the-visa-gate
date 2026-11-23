import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ScrollText, Shield, User, Clock, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/audit-logs');
      if (res.data) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy font-serif">System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable security and compliance log of all transactions, status changes, and user activities.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[760px]">
            <caption className="sr-only">System audit trail of recorded actions</caption>
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Timestamp (UTC)</th>
                <th className="py-3 px-6">Operator / Actor</th>
                <th className="py-3 px-6">Action Performed</th>
                <th className="py-3 px-6">Entity</th>
                <th className="py-3 px-6">Details</th>
                <th className="py-3 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 font-semibold text-brand-navy">
                      {log.userName}
                      <span className="block text-[9px] text-slate-400 font-normal">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded bg-brand-navy text-brand-gold font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                    </td>
                    <td className="py-3 px-6 text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-6 text-right text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
