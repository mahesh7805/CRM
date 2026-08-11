import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Warehouse, Tag, Boxes, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading product details...</div>;
  if (error || !product) {
    return (
      <div className="p-8 text-center text-rose-600 glass-panel rounded-2xl">
        <p className="font-bold">Product not found.</p>
        <Link to="/products" className="text-xs text-brand-600 hover:underline mt-2 block">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/products" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Product Catalog
      </Link>

      {/* Product Banner Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge ${
                product.stockStatus === 'OUT_OF_STOCK' ? 'badge-out-of-stock' :
                product.stockStatus === 'LOW_STOCK' ? 'badge-low-stock' : 'badge-in-stock'
              }`}>
                {product.stockStatus?.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono font-bold text-brand-600">{product.sku}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Unit Price</span>
              <span className="text-2xl font-black text-emerald-600">₹{product.unitPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Available Stock</span>
              <span className="text-2xl font-black text-slate-900">{product.currentStock}</span>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <Tag className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
              <span className="font-semibold text-slate-900">{product.category?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <Warehouse className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Warehouse Location</span>
              <span className="font-semibold text-slate-900">{product.warehouse?.name} ({product.warehouse?.code})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <Boxes className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Minimum Alert Threshold</span>
              <span className="font-bold text-amber-600">{product.minStockQuantity} Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movement History Ledger */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-brand-600" /> Stock Movement History Ledger
          </h3>
          <span className="text-xs text-slate-500">All inbound / outbound transactions for this SKU</span>
        </div>

        {!product.stockMovements || product.stockMovements.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No stock movements recorded for this item.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4 text-center">Type</th>
                  <th className="py-2.5 px-4 text-center">Quantity</th>
                  <th className="py-2.5 px-4">Reason / Source</th>
                  <th className="py-2.5 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.stockMovements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${m.movementType === 'IN' ? 'badge-in' : 'badge-out'}`}>
                        {m.movementType === 'IN' ? <ArrowDownRight className="w-3 h-3 mr-1 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 mr-1 text-indigo-600" />}
                        {m.movementType}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-center font-black ${m.movementType === 'IN' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                      {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {m.reason}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-semibold">
                      {m.createdBy?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
