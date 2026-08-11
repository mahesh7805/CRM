import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  User,
} from 'lucide-react';
import api from '../services/api';
import { Customer, CustomerFollowup, Challan } from '../types';
import { useAuth } from '../context/AuthContext';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal for new follow-up
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState('');

  const canWrite = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    if (id) fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.customer);
      setTimeline(res.data.timeline);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes || !newDate) return;

    try {
      await api.post('/followups', {
        customerId: id,
        notes: newNotes,
        followupDate: newDate,
      });
      setShowFollowupModal(false);
      setNewNotes('');
      setNewDate('');
      fetchCustomerDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCompleteFollowup = async (followupId: string) => {
    try {
      await api.post(`/followups/${followupId}/complete`, {});
      fetchCustomerDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading customer account timeline...</div>;
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center text-rose-600 glass-panel rounded-2xl">
        <p className="font-bold">Customer account not found.</p>
        <Link to="/customers" className="text-xs text-brand-600 hover:underline mt-2 block">← Back to Customer List</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link to="/customers" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        {canWrite && (
          <button
            onClick={() => setShowFollowupModal(true)}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Follow-up
          </button>
        )}
      </div>

      {/* Customer Overview Header Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge ${customer.status === 'LEAD' ? 'badge-lead' : customer.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                {customer.status}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{customer.customerType}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{customer.businessName}</h1>
            <p className="text-xs text-brand-700 font-bold flex items-center gap-2 mt-0.5">
              <User className="w-3.5 h-3.5" /> Contact: {customer.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/challans/new?customerId=${customer.id}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all"
            >
              <FileText className="w-4 h-4 text-brand-600" /> Create Challan for Customer
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Contact Channels</span>
            <p className="flex items-center gap-2 text-slate-900 font-semibold"><Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.mobile}</p>
            <p className="flex items-center gap-2 text-slate-900 font-semibold"><Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Taxation & Location</span>
            <p className="flex items-center gap-2 text-slate-900 font-semibold"><Building2 className="w-3.5 h-3.5 text-slate-400" /> GST: {customer.gstNumber || 'Unregistered'}</p>
            <p className="text-slate-600 leading-snug">{customer.address}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Next CRM Follow-up</span>
            {customer.followupDate ? (
              <p className="text-sky-700 font-black flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" /> {new Date(customer.followupDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            ) : (
              <p className="text-slate-500 italic">No pending follow-ups scheduled.</p>
            )}
            {customer.notes && <p className="text-[11px] text-slate-500 italic">"{customer.notes}"</p>}
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Timeline & CRM Followup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-brand-600" /> Customer Activity Timeline
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  item.type === 'CHALLAN_CREATED' ? 'bg-emerald-500' :
                  item.type === 'FOLLOWUP_SCHEDULED' ? 'bg-sky-500' : 'bg-purple-500'
                }`} />

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{item.description}</p>
                  {item.user && (
                    <span className="text-[10px] text-brand-600 font-bold block mt-1">Logged by {item.user}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Follow-ups Column */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" /> Follow-up Ledger
            </h3>
          </div>

          <div className="space-y-3">
            {customer.followups?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No follow-ups recorded.</p>
            ) : (
              customer.followups?.map((f: any) => {
                const isPending = f.status === 'PENDING';
                const isOverdue = isPending && new Date(f.followupDate) < new Date();

                return (
                  <div key={f.id} className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    isOverdue ? 'bg-rose-50 border-rose-200' :
                    isPending ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isOverdue ? 'text-rose-700' : isPending ? 'text-sky-700' : 'text-slate-600'}`}>
                        {new Date(f.followupDate).toLocaleDateString()}
                      </span>
                      <span className={`badge ${f.status === 'COMPLETED' ? 'badge-confirmed' : isOverdue ? 'badge-out-of-stock' : 'badge-draft'}`}>
                        {isOverdue ? 'OVERDUE' : f.status}
                      </span>
                    </div>

                    <p className="text-slate-800 text-[11px] font-semibold leading-snug">{f.notes}</p>

                    {isPending && canWrite && (
                      <button
                        onClick={() => handleCompleteFollowup(f.id)}
                        className="mt-1 w-full py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Modal: Schedule Followup */}
      {showFollowupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Schedule CRM Follow-up</h2>
            <form onSubmit={handleAddFollowup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Follow-up Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Action Items *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Call Sanjay regarding payment terms confirmation..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
