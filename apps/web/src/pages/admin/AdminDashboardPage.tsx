import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  Globe2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res: any = await api.get('/reports/dashboard');
        if (res.data) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading dashboard analytics...</div>;
  }

  const { summary, charts, recentApplications } = data;

  const kpis = [
    { title: 'Total Clients', value: summary.totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Applications', value: summary.activeApplications, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Completed Cases', value: summary.completedApplications, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Documents', value: summary.pendingDocuments, icon: FileCheck2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Upcoming Procedures', value: summary.upcomingProcedures, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Overdue Tasks', value: summary.overdueTasks, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    {
      title: 'Payments Received',
      value: `৳${Number(summary.totalPaymentsReceived).toLocaleString()}`,
      icon: CreditCard,
      color: 'text-brand-navy',
      bg: 'bg-brand-gold/15',
    },
  ];

  const PIE_COLORS = ['#102440', '#D6B66E', '#16856A', '#D99A30', '#DC4545'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
            Operations & Performance Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational indicators calculated directly from active client and case records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/clients"
            className="px-4 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-colors shadow-xs"
          >
            + Register Client
          </Link>
          <Link
            to="/admin/applications"
            className="px-4 py-2 rounded-lg bg-brand-gold text-brand-navy text-xs font-bold hover:bg-brand-gold-light transition-colors shadow-xs"
          >
            + New Application
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-500 truncate">{kpi.title}</p>
                <p className="text-xl sm:text-2xl font-black text-brand-navy font-serif tracking-tight mt-0.5">
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Country Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-navy font-serif">Applications by Destination</h3>
              <p className="text-xs text-slate-500">Distribution across active markets</p>
            </div>
            <Globe2 className="w-4 h-4 text-brand-gold-dark" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.applicationsByCountry}>
                <XAxis dataKey="country" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102440', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#102440" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-navy font-serif">Case Status Breakdown</h3>
              <p className="text-xs text-slate-500">Active portfolio health</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-gold-dark" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution.filter((s: any) => s.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label
                >
                  {charts.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#102440', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy font-serif">Recently Created Applications</h3>
            <p className="text-xs text-slate-500">Latest active cases recorded in system</p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-bold text-brand-navy hover:text-brand-gold-dark flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[640px]">
            <caption className="sr-only">Recently created visa applications</caption>
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Application Code</th>
                <th className="py-3 px-6">Applicant Name</th>
                <th className="py-3 px-6">Destination</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications.map((app: any) => (
                <tr key={app.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-6 font-mono font-bold text-brand-navy">
                    {app.code}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">
                    {app.clientName}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {app.country}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">
                    {app.date}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
