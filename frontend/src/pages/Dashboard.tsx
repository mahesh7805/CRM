import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  CalendarClock,
  TrendingUp,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
  CheckCircle2,
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
} from 'recharts';
import api from '../services/api';
import { DashboardSummary } from '../types';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-rose-600 shadow-sm">
        <p className="font-bold">Failed to load dashboard operational data.</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { kpis, lowStockProducts, recentMovements, recentAuditLogs, recentChallans, charts } = data;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory valuation, challans, CRM follow-ups, and stock metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challans/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4" /> + New Sales Challan
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Boxes className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            ₹{kpis.totalInventoryValue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-2 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {kpis.totalProducts} Catalog Products</span>
          </div>
        </div>

        {/* Low Stock Alert KPI */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 tracking-tight">
            {kpis.lowStockCount} <span className="text-xs font-normal text-slate-500">Items</span>
          </p>
          <Link to="/products?stockStatus=LOW_STOCK" className="text-[11px] text-amber-700 hover:underline mt-2 inline-flex items-center gap-1 font-semibold">
            Requires Attention <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pending Follow-ups */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CRM Follow-ups Due</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
              <CalendarClock className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {kpis.pendingFollowups}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-2 font-semibold">
            <span>{kpis.overdueFollowups} Overdue Follow-ups</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customers Onboarded</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {kpis.totalCustomers}
          </p>
          <div className="text-[11px] text-slate-600 mt-2 font-semibold">
            {kpis.activeCustomers} Active Accounts
          </div>
        </div>
      </div>

      {/* Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Inventory Valuation Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Stock Valuation by Category</h3>
              <p className="text-[11px] text-slate-500">Total capital allocated per product category</p>
            </div>
            <span className="text-xs text-brand-700 font-bold bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full">
              Category Distribution
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.categoryChartData}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                {/* cursor={{ fill: 'transparent' }} REMOVES THE WHITE OVERLAY ON HOVER */}
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Valuation']}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer Portfolio</h3>
            <p className="text-[11px] text-slate-500">Status breakdown across leads, active and inactive</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.customerStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={68}
                  innerRadius={38}
                >
                  {charts.customerStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {charts.customerStatusBreakdown.map((st, i) => (
              <div key={st.status} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">{st.status}</span>
                <span className="text-sm font-black" style={{ color: COLORS[i % COLORS.length] }}>
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Highlights: Low Stock Alert List & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert Table */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Low Stock Warning Items</h3>
            </div>
            <Link to="/products" className="text-xs font-bold text-brand-600 hover:underline">View Catalog →</Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No low stock items currently.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-500 uppercase bg-slate-100/80 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3 text-center">Current</th>
                    <th className="py-2.5 px-3 text-center">Min Alert</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{p.sku}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-amber-600 text-sm">
                        {p.currentStock}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">
                        {p.minStockQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`badge ${p.stockStatus === 'OUT_OF_STOCK' ? 'badge-out-of-stock' : 'badge-low-stock'}`}>
                          {p.stockStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Activity Stream */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Audit & Stock Feed</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Live Transaction Audit</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-3 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="font-bold text-brand-700">{log.user?.name || 'System'}</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
