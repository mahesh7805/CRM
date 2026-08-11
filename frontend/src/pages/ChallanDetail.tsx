import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, ShieldAlert, Building2, User, FileText } from 'lucide-react';
import api from '../services/api';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    if (id) fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data.challan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!challan) return;
    if (!window.confirm(`Confirm Challan ${challan.challanNumber}? This will deduct inventory stock immediately.`)) return;

    setConfirming(true);
    setError(null);
    try {
      await api.post(`/challans/${challan.id}/confirm`, {});
      fetchChallan();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm challan.');
    } finally {
      setConfirming(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading delivery challan invoice...</div>;

  if (error || !challan) {
    return (
      <div className="p-8 text-center text-rose-600 glass-panel rounded-2xl">
        <p className="font-bold">Challan not found or transaction error.</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/challans" className="text-xs text-brand-600 hover:underline mt-2 block">← Back to Challans</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/challans" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Challans List
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-brand-600" /> Print Delivery Challan / Tax Invoice
          </button>

          {challan.status === 'DRAFT' && canWrite && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Deduct Stock
            </button>
          )}
        </div>
      </div>

      {/* Printable Delivery Challan / Invoice Card */}
      <div className="glass-panel p-8 rounded-2xl space-y-6 bg-white border border-slate-200 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        
        {/* Header Branding */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-base print:bg-black">
                E
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight print:text-black">FUNDSROOM ENTERPRISES</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Wholesale & Industrial Distribution Operations</p>
            <p className="text-[11px] text-slate-500">MIDC Industrial Area, Andheri East, Mumbai, MH - 400093 | GST: 27AABCF1002A1ZB</p>
          </div>

          <div className="text-right space-y-1">
            <span className={`badge ${
              challan.status === 'CONFIRMED' ? 'badge-confirmed' :
              challan.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-draft'
            } print:border print:border-black print:text-black`}>
              {challan.status}
            </span>
            <h2 className="text-2xl font-black font-mono text-slate-900 print:text-black">{challan.challanNumber}</h2>
            <p className="text-xs text-slate-500 font-semibold">Date: {new Date(challan.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Dispatch Details */}
        <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Billed & Dispatched To:</span>
            <h3 className="text-sm font-extrabold text-slate-900 print:text-black">{challan.customer?.businessName}</h3>
            <p className="text-slate-700 font-semibold mt-0.5">Contact Person: {challan.customer?.name} ({challan.customer?.mobile})</p>
            <p className="text-slate-600 font-medium">GSTIN: {challan.customer?.gstNumber || 'Unregistered'}</p>
            <p className="text-slate-600 mt-1">{challan.customer?.address}</p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Logistics & Prepared By:</span>
            <p className="text-slate-700 font-semibold">Created By: {challan.createdBy?.name}</p>
            <p className="text-slate-600">Transport / LR Notes: {challan.notes || 'Direct Customer Pickup'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider print:text-black">Itemized Delivery Particulars</h4>
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200 print:bg-slate-100 print:text-black">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description / SKU</th>
                <th className="py-2.5 px-3 text-center">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {challan.items?.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 print:text-black">{item.productName}</p>
                    <p className="text-[10px] text-brand-600 font-mono font-bold print:text-black">{item.productSku}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 print:text-black">{item.quantity} units</td>
                  <td className="py-3 px-3 text-right text-slate-800 font-semibold">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 print:text-black">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 font-bold bg-slate-50/80">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-slate-700">Summary Total</td>
                <td className="py-3 px-3 text-center font-black text-slate-900">{challan.totalQuantity} units</td>
                <td className="py-3 px-3 text-right text-slate-500">Subtotal</td>
                <td className="py-3 px-3 text-right font-black text-emerald-600 text-sm print:text-black">₹{challan.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Signature Blocks */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
          <div className="border-t border-slate-300 pt-2">
            <p className="font-bold text-slate-800">Receiver's Signature & Seal</p>
            <p className="text-[10px] text-slate-400 mt-1">Goods received in good condition</p>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <p className="font-bold text-slate-800">For FUNDSROOM ENTERPRISES</p>
            <p className="text-[10px] text-slate-400 mt-1">Authorized Signatory</p>
          </div>
        </div>

      </div>
    </div>
  );
};
