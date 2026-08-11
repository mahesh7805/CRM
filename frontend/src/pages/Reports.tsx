import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Boxes, FileCheck, DollarSign, Calendar } from 'lucide-react';
import api from '../services/api';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'CHALLANS'>('INVENTORY');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [challanData, setChallanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'INVENTORY') {
        const res = await api.get('/reports/inventory');
        setInventoryData(res.data.report);
      } else {
        const res = await api.get('/reports/challans');
        setChallanData(res.data.report);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (activeTab === 'INVENTORY') {
      filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Product Name', 'SKU', 'Category', 'Warehouse', 'Unit Price', 'Current Stock', 'Min Alert Qty', 'Total Valuation', 'Stock Status'];
      rows = inventoryData.map((item) => [
        `"${item.name}"`,
        `"${item.sku}"`,
        `"${item.category}"`,
        `"${item.warehouse}"`,
        item.unitPrice,
        item.currentStock,
        item.minStockQuantity,
        item.totalValue,
        item.stockStatus,
      ]);
    } else {
      filename = `sales_challan_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Challan No', 'Business Name', 'Customer Contact', 'Status', 'Items Qty', 'Total Amount', 'Created By', 'Date'];
      rows = challanData.map((item) => [
        `"${item.challanNumber}"`,
        `"${item.businessName}"`,
        `"${item.customerName}"`,
        item.status,
        item.totalQuantity,
        item.totalAmount,
        `"${item.createdBy}"`,
        `"${new Date(item.createdAt).toLocaleDateString()}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operational & Financial Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit reports for inventory valuation and sales fulfillment</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'INVENTORY' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inventory Valuation Ledger
        </button>
        <button
          onClick={() => setActiveTab('CHALLANS')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CHALLANS' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sales Challans Summary
        </button>
      </div>

      {/* Report Content Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Compiling financial report...</div>
        ) : activeTab === 'INVENTORY' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Total Valuation (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{row.name}</p>
                      <p className="text-[10px] text-brand-600 font-mono font-bold">{row.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{row.category}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{row.warehouse}</td>
                    <td className="py-3 px-4 text-right text-slate-800 font-semibold">₹{row.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{row.currentStock}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">₹{row.totalValue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${
                        row.stockStatus === 'OUT_OF_STOCK' ? 'badge-out-of-stock' :
                        row.stockStatus === 'LOW_STOCK' ? 'badge-low-stock' : 'badge-in-stock'
                      }`}>
                        {row.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/90 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4 text-center">Items Qty</th>
                  <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challanData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.challanNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{row.businessName}</p>
                      <p className="text-[10px] text-slate-500">{row.customerName}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{row.totalQuantity} units</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">₹{row.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${
                        row.status === 'CONFIRMED' ? 'badge-confirmed' :
                        row.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-draft'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">{row.createdBy}</td>
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
