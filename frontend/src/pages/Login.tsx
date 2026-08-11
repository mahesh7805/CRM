import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Warehouse, CreditCard, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { RoleName } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: RoleName) => {
    const presets: Record<RoleName, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@fundsroom.com', pass: 'admin123' },
      SALES: { email: 'sales@fundsroom.com', pass: 'sales123' },
      WAREHOUSE: { email: 'warehouse@fundsroom.com', pass: 'wh123456' },
      ACCOUNTS: { email: 'accounts@fundsroom.com', pass: 'acc123456' },
    };

    const target = presets[role];
    setEmail(target.email);
    setPassword(target.pass);
    setLoading(true);
    setError(null);
    try {
      await login(target.email, target.pass);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50 flex items-center justify-center p-4 selection:bg-brand-600 selection:text-white">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center bg-white/80 border border-slate-200 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl">
        
        {/* Left Side: Brand & Quick Presets */}
        <div className="space-y-6 md:border-r border-slate-200 md:pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
              E
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">FUNDSROOM ERP</h1>
              <p className="text-xs text-brand-600 font-bold">Operations & CRM Portal</p>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              One-Click Demo Role Login
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Select any role below to test RBAC permissions instantly:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 hover:border-purple-400 hover:bg-purple-100/70 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200/80 text-purple-900">ADMIN</span>
                </div>
                <p className="text-xs font-bold text-slate-800">Full System Access</p>
                <p className="text-[10px] text-slate-500">admin@fundsroom.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SALES')}
                className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <UserCheck className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-900">SALES</span>
                </div>
                <p className="text-xs font-bold text-slate-800">CRM & Challans</p>
                <p className="text-[10px] text-slate-500">sales@fundsroom.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('WAREHOUSE')}
                className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 hover:bg-amber-100/70 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <Warehouse className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">WAREHOUSE</span>
                </div>
                <p className="text-xs font-bold text-slate-800">Stock & Inventory</p>
                <p className="text-[10px] text-slate-500">warehouse@fundsroom.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ACCOUNTS')}
                className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/70 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900">ACCOUNTS</span>
                </div>
                <p className="text-xs font-bold text-slate-800">Billing & Reports</p>
                <p className="text-[10px] text-slate-500">accounts@fundsroom.com</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900">Employee Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your operational credentials to access your workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fundsroom.com"
                  required
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
