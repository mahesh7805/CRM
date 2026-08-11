import React, { useState } from 'react';
import { Search, Bell, LogOut, User as UserIcon, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

export const Header: React.FC<{ onGlobalSearch?: (query: string) => void }> = ({ onGlobalSearch }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  const handleRoleClick = async (role: RoleName) => {
    if (user?.role === role) return;
    setSwitching(true);
    try {
      await quickSwitchRole(role);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Global Search Input */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Global search customers, SKUs, challans..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Role Switcher Toolbar (for easy testing across roles) */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/80">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-600" /> Demo Switcher:
        </span>
        {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as RoleName[]).map((r) => (
          <button
            key={r}
            disabled={switching}
            onClick={() => handleRoleClick(r)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              user?.role === r
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Operational Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> System Alerts
                </h4>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="py-3 space-y-2 max-h-60 overflow-y-auto text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <p className="font-bold text-[11px]">Low Stock Warning</p>
                  <p className="text-[10px] text-amber-800/90 mt-0.5">Digital Multimeter Pro (SKU: ELEC-MM-003) is below minimum threshold (8 left).</p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                  <p className="font-bold text-[11px]">Pending CRM Follow-up</p>
                  <p className="text-[10px] text-sky-800/90 mt-0.5">Follow-up due today with Delhi Machinery Corp.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Current User Badge & Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-bold text-xs">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
