import React, { useState, useEffect } from 'react';
import { Boxes, ArrowDownRight, ArrowUpRight, Plus, Search, Filter, History, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { StockMovement, Product } from '../types';
import { useAuth } from '../context/AuthContext';

export const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Adjustment Modal
  const [showModal, setShowModal] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjQty, setAdjQty] = useState('');
  const [adjType, setAdjType] = useState<'IN' | 'OUT'>('IN');
  const [adjReason, setAdjReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canAdjust = hasRole(['ADMIN', 'WAREHOUSE']);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter, productFilter, page]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      setProducts(res.data.products);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/movements', {
        params: { search, movementType: typeFilter, productId: productFilter, page, limit: 12 },
      });
      setMovements(res.data.movements);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustModal = () => {
    setAdjProductId(products[0]?.id || '');
    setAdjQty('');
    setAdjType('IN');
    setAdjReason('');
    setShowModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProductId || !adjQty || !adjReason) {
      alert('Product, Quantity, and Reason are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        productId: adjProductId,
        quantity: parseInt(adjQty, 10),
        movementType: adjType,
        reason: adjReason,
      });
      setShowModal(false);
      fetchMovements();
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory & Stock Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable transaction audit trail for all inbound and outbound stock changes</p>
        </div>
        {canAdjust && (
          <button
            onClick={handleOpenAdjustModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Manual Stock Adjustment
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reason, product name, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Movement Types</option>
            <option value="IN">IN (Inbound / Restock)</option>
            <option value="OUT">OUT (Outbound / Fulfillment)</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500 max-w-[200px]"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading stock movement ledger...</div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No stock movements found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4">Reason & Audit Trail</th>
                  <th className="py-3 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{m.product?.name}</p>
                      <p className="text-[10px] text-brand-600 font-mono font-bold">{m.product?.sku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`badge ${m.movementType === 'IN' ? 'badge-in' : 'badge-out'}`}>
                        {m.movementType === 'IN' ? (
                          <ArrowDownRight className="w-3 h-3 mr-1 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-1 text-indigo-600" />
                        )}
                        {m.movementType}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-center font-black text-sm ${
                      m.movementType === 'IN' ? 'text-emerald-700' : 'text-indigo-700'
                    }`}>
                      {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {m.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-semibold">
                      {m.createdBy?.name}
                      {m.createdBy?.role?.name && (
                        <span className="text-[10px] text-slate-500 block font-normal">
                          {m.createdBy.role.name}
                        </span>
                      )}
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

      {/* Stock Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4.5 h-4.5 text-brand-600" /> Manual Stock Adjustment
            </h2>
            <p className="text-xs text-slate-500">
              Record manual warehouse inbound restock or outbound adjustment with strict audit logging.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Product SKU *</label>
                <select
                  required
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Current Stock: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Movement Type *</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as 'IN' | 'OUT')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="IN">IN (+ Add Stock)</option>
                    <option value="OUT">OUT (- Deduct Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mandatory Audit Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplier Shipment Recd / Damaged Goods Return..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Executing Transaction...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
