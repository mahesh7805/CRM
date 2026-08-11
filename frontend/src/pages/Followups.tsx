import React, { useState, useEffect } from 'react';
import { CalendarClock, CheckCircle2, Clock, Filter, AlertCircle, Building2, Phone } from 'lucide-react';
import api from '../services/api';
import { CustomerFollowup } from '../types';
import { useAuth } from '../context/AuthContext';

export const Followups: React.FC = () => {
  const { hasRole } = useAuth();
  const [followups, setFollowups] = useState<CustomerFollowup[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING'>('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const canWrite = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    fetchFollowups();
  }, [filter, statusFilter]);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/followups', {
        params: { filter, status: statusFilter, limit: 20 },
      });
      setFollowups(res.data.followups);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.post(`/followups/${id}/complete`, {});
      fetchFollowups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">CRM Follow-up Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track scheduled client touchpoints, overdue calls, and sales pipeline follow-ups</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'TODAY', 'OVERDUE', 'UPCOMING'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'TODAY' ? 'Due Today' : tab === 'OVERDUE' ? 'Overdue Tasks' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="PENDING">Pending Tasks Only</option>
            <option value="COMPLETED">Completed Tasks</option>
            <option value="ALL">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading follow-ups...</div>
        ) : followups.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl text-slate-500 text-xs">
            No follow-ups match current filter criteria.
          </div>
        ) : (
          followups.map((f) => {
            const isPending = f.status === 'PENDING';
            const isOverdue = f.isOverdue;

            return (
              <div
                key={f.id}
                className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border transition-all ${
                  isOverdue ? 'border-rose-300 bg-rose-50/60' : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${f.status === 'COMPLETED' ? 'badge-confirmed' : isOverdue ? 'badge-out-of-stock' : 'badge-draft'}`}>
                      {isOverdue ? 'OVERDUE' : f.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" /> {f.customer?.businessName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">{f.notes}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Contact: <strong className="text-slate-800">{f.customer?.name} ({f.customer?.mobile})</strong></span>
                    <span>•</span>
                    <span>Scheduled by: <strong className="text-brand-700">{f.createdBy?.name}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:flex-col md:items-end flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Date</span>
                    <span className={`text-xs font-bold ${isOverdue ? 'text-rose-600' : 'text-sky-700'}`}>
                      {new Date(f.followupDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  {isPending && canWrite && (
                    <button
                      onClick={() => handleComplete(f.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
