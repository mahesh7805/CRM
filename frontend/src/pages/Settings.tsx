import React from 'react';
import { Settings as SettingsIcon, Server, Database, Shield, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Configuration & Health</h1>
          <p className="text-xs text-slate-500 mt-0.5">System status, environment metadata, and database connection details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4.5 h-4.5 text-brand-600" /> Active Server Infrastructure
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">Environment Mode</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">development (local)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">API Endpoint</span>
              <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-bold">http://localhost:5000/api</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">Authentication</span>
              <span className="font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">JWT Bearer Security</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-emerald-600" /> Database & ORM Engine
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">ORM Engine</span>
              <span className="font-mono text-slate-800 font-bold">Prisma Client v5.22.0</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">Local Connector</span>
              <span className="font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">SQLite (dev.db)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-600 font-semibold">Production Compatibility</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">PostgreSQL Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
