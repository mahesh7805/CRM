import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle2, FileCheck, Building2, Package } from 'lucide-react';
import api from '../services/api';
import { Customer, Product } from '../types';

interface LineItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  currentStock: number;
  name: string;
  sku: string;
}

export const ChallanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCustId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustId);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItemInput[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFormMetadata();
  }, []);

  const fetchFormMetadata = async () => {
    try {
      setLoading(true);
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers', { params: { limit: 100 } }),
        api.get('/products', { params: { limit: 100 } }),
      ]);
      setCustomers(custRes.data.customers);
      setProducts(prodRes.data.products);
      if (!selectedCustomerId && custRes.data.customers.length > 0) {
        setSelectedCustomerId(custRes.data.customers[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLineItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        quantity: 1,
        unitPrice: p.unitPrice,
        currentStock: p.currentStock,
        name: p.name,
        sku: p.sku,
      },
    ]);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const p = products.find((prod) => prod.id === newProductId);
    if (!p) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: p.id,
        quantity: 1,
        unitPrice: p.unitPrice,
        currentStock: p.currentStock,
        name: p.name,
        sku: p.sku,
      };
      return copy;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = Math.max(1, qty);
      return copy;
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const grandTotalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (targetStatus: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId) {
      setError('Please select a valid customer account.');
      return;
    }
    if (items.length === 0) {
      setError('At least one product line item is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        customerId: selectedCustomerId,
        status: targetStatus,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/challans', payload);
      const newChallan = res.data.challan;

      // If user chose CONFIRMED directly, execute confirmation endpoint
      if (targetStatus === 'CONFIRMED') {
        await api.post(`/challans/${newChallan.id}/confirm`, {});
      }

      navigate(`/challans/${newChallan.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create sales challan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Initializing challan wizard...</div>;

  return (
    <div className="space-y-6">
      <Link to="/challans" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Challans List
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Sales Delivery Challan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate draft quotations or execute stock deduction sales delivery challans</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Selection Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-600" /> Customer Account Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Customer Account *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name} - GST: {c.gstNumber || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dispatch & Transport Notes</label>
            <input
              type="text"
              placeholder="e.g. Delivery via GATI Transport LR #991823..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Product Line Items Wizard */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" /> Line Items & Quantities
          </h3>
          <button
            type="button"
            onClick={handleAddLineItem}
            className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product Row
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
            No products added yet. Click "+ Add Product Row" to select items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product SKU Selection</th>
                  <th className="py-2.5 px-3 text-center">Available Stock</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 text-center">Order Qty</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  const isStockDeficit = item.quantity > item.currentStock;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-brand-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono font-bold ${isStockDeficit ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.currentStock} units
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value, 10) || 1)}
                          className={`w-20 text-center bg-slate-50 border rounded-xl py-1 text-xs font-bold text-slate-900 ${
                            isStockDeficit ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-200'
                          }`}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Calculation Summary Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-100/80 border border-slate-200 mt-4">
          <div className="text-xs text-slate-600 font-semibold">
            <span>Total Units: <strong className="text-slate-900">{grandTotalQuantity}</strong></span>
            <span className="ml-4">Line Items: <strong className="text-slate-900">{items.length}</strong></span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Grand Total Valuation</span>
            <span className="text-xl font-black text-emerald-600">₹{grandTotalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={submitting || items.length === 0}
          onClick={() => handleSubmit('DRAFT')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          Save as Draft Quotation
        </button>
        <button
          type="button"
          disabled={submitting || items.length === 0}
          onClick={() => handleSubmit('CONFIRMED')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" /> Confirm & Deduct Stock Immediately
        </button>
      </div>
    </div>
  );
};
