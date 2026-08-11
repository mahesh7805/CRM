import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Plus, Search, Filter, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';

export const Challans: React.FC = () => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canWrite = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter, page]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/challans', {
        params: { search, status: statusFilter, page, limit: 10 },
      });
      setChallans(res.data.challans);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDirect = async (id: string, challanNumber: string) => {
    if (!window.confirm(`Confirm Challan ${challanNumber}? This will validate inventory and deduct stock immediately.`)) return;

    try {
      await api.post(`/challans/${id}/confirm`, {});
      fetchChallans();
    } catch (err: any) {
      alert(`Transaction Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Delivery Challans</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer orders, draft quotations, and transaction-safe stock fulfillments</p>
        </div>
        {canWrite && (
          <Link
            to="/challans/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Sales Challan
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by challan number (e.g. CH-1001), customer, or business..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft Only</option>
            <option value="CONFIRMED">Confirmed & Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading sales challans...</div>
        ) : challans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No sales challans match current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Challan No. & Date</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4 text-center">Items Qty</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900 text-sm">{ch.challanNumber}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{new Date(ch.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{ch.customer?.businessName}</p>
                      <p className="text-[11px] text-brand-600 font-semibold">{ch.customer?.name} ({ch.customer?.mobile})</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {ch.totalQuantity} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                      ₹{ch.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`badge ${
                        ch.status === 'CONFIRMED' ? 'badge-confirmed' :
                        ch.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-draft'
                      }`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/challans/${ch.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-brand-600 hover:bg-slate-200 transition-colors flex items-center gap-1 font-semibold"
                          title="View Printable Delivery Challan"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        {ch.status === 'DRAFT' && canWrite && (
                          <button
                            onClick={() => handleConfirmDirect(ch.id, ch.challanNumber)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-bold transition-all"
                            title="Confirm Challan & Deduct Stock"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
