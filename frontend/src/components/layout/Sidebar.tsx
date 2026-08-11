import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileCheck,
  CalendarClock,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Eye,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

interface SubNavItem {
  title: string;
  path: string;
  icon?: any;
}

interface NavItem {
  title: string;
  path?: string;
  icon: any;
  children?: SubNavItem[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';
  const location = useLocation();

  // Expanded parents state
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({
    'Sales Challans': true,
    'Customers CRM': true,
    'Product Catalog': true,
    'Inventory & Stock': true,
    'Reports & Analytics': true,
  });

  const toggleParent = (title: string) => {
    setOpenParents((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Role-Specific Hierarchical Navigation (Parent -> Child items)
  const roleNavConfig: Record<
    RoleName,
    {
      categoryTitle: string;
      items: NavItem[];
    }
  > = {
    ADMIN: {
      categoryTitle: 'System Governance',
      items: [
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        {
          title: 'Sales Challans',
          icon: FileCheck,
          children: [
            { title: 'View All Challans', path: '/challans', icon: Eye },
            { title: 'Create Sales Challan', path: '/challans/new', icon: PlusCircle },
          ],
        },
        {
          title: 'Customers CRM',
          icon: Users,
          children: [
            { title: 'Customer Directory', path: '/customers', icon: Users },
            { title: 'CRM Follow-ups', path: '/followups', icon: CalendarClock },
          ],
        },
        {
          title: 'Product Catalog',
          icon: Package,
          children: [
            { title: 'All Products', path: '/products', icon: Package },
            { title: 'Low Stock Alerts', path: '/products?stockStatus=LOW_STOCK', icon: AlertTriangle },
          ],
        },
        {
          title: 'Inventory & Stock',
          icon: Boxes,
          children: [
            { title: 'Stock Movement Ledger', path: '/inventory', icon: Boxes },
          ],
        },
        { title: 'User Governance', path: '/users', icon: UserCheck }, // ADMIN SPECIAL
        {
          title: 'Reports & Analytics',
          icon: BarChart3,
          children: [
            { title: 'Inventory Valuation', path: '/reports', icon: FileSpreadsheet },
            { title: 'Sales Challan Summary', path: '/reports?tab=challans', icon: Receipt },
          ],
        },
        { title: 'System Settings', path: '/settings', icon: Settings },
      ],
    },
    SALES: {
      categoryTitle: 'Sales & CRM Suite',
      items: [
        { title: 'Sales Dashboard', path: '/', icon: LayoutDashboard },
        {
          title: 'Sales Challans',
          icon: FileCheck,
          children: [
            { title: 'Create Sales Challan', path: '/challans/new', icon: PlusCircle },
            { title: 'View All Challans', path: '/challans', icon: Eye },
          ],
        },
        {
          title: 'Customers CRM',
          icon: Users,
          children: [
            { title: 'Customer Directory', path: '/customers', icon: Users },
            { title: 'Follow-up Scheduler', path: '/followups', icon: CalendarClock },
          ],
        },
        { title: 'Product Catalog View', path: '/products', icon: Package },
        { title: 'Sales Performance Reports', path: '/reports', icon: BarChart3 },
        { title: 'Settings', path: '/settings', icon: Settings },
      ],
    },
    WAREHOUSE: {
      categoryTitle: 'Stock & Fulfillment',
      items: [
        { title: 'Warehouse Dashboard', path: '/', icon: LayoutDashboard },
        {
          title: 'Inventory & Restock',
          icon: Boxes,
          children: [
            { title: 'Movement Ledger', path: '/inventory', icon: Boxes },
          ],
        },
        {
          title: 'Product Catalog',
          icon: Package,
          children: [
            { title: 'Catalog Items', path: '/products', icon: Package },
            { title: 'Low Stock Alerts', path: '/products?stockStatus=LOW_STOCK', icon: AlertTriangle },
          ],
        },
        { title: 'Fulfillment Challans', path: '/challans', icon: FileCheck },
        { title: 'Stock Valuation Reports', path: '/reports', icon: BarChart3 },
        { title: 'Settings', path: '/settings', icon: Settings },
      ],
    },
    ACCOUNTS: {
      categoryTitle: 'Billing & Accounting Suite',
      items: [
        { title: 'Financial Dashboard', path: '/', icon: LayoutDashboard },
        {
          title: 'Sales Invoices & Challans',
          icon: Receipt,
          children: [
            { title: 'View All Challans', path: '/challans', icon: Eye },
          ],
        },
        { title: 'Customer Accounts', path: '/customers', icon: Users },
        {
          title: 'Financial Reports',
          icon: BarChart3,
          children: [
            { title: 'Inventory Valuation', path: '/reports', icon: FileSpreadsheet },
            { title: 'Challan Revenue Summary', path: '/reports?tab=challans', icon: Receipt },
          ],
        },
        { title: 'Product Price List', path: '/products', icon: Package },
        { title: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  };

  const currentNav = roleNavConfig[currentRole];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col flex-shrink-0 min-h-screen select-none shadow-sm z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200/80 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-bold text-lg">
            E
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">FUNDSROOM</h1>
            <p className="text-[11px] text-brand-600 font-semibold tracking-wide">MINI ERP & CRM PORTAL</p>
          </div>
        </div>
      </div>

      {/* Role Badge Banner */}
      <div className="mx-3 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700">Workspace</span>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
          user?.role === 'SALES' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
          user?.role === 'WAREHOUSE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
          'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
          {user?.role}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {currentNav.categoryTitle}
        </div>

        {currentNav.items.map((item) => {
          // If item has children sub-menu
          if (item.children && item.children.length > 0) {
            const isOpen = !!openParents[item.title];
            const isChildActive = item.children.some(
              (child) => location.pathname + location.search === child.path || location.pathname === child.path
            );

            return (
              <div key={item.title} className="space-y-1">
                {/* Parent Header Button */}
                <button
                  type="button"
                  onClick={() => toggleParent(item.title)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isChildActive
                      ? 'bg-slate-100/90 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isChildActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Child Sub-Menu Links */}
                {isOpen && (
                  <div className="pl-6 space-y-1 border-l-2 border-slate-200 ml-5 my-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path + child.title}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                            isActive || location.pathname + location.search === child.path
                              ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2">
                          {child.icon ? (
                            <child.icon className="w-3.5 h-3.5 text-brand-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          )}
                          <span>{child.title}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Single Link Menu Item
          return (
            <NavLink
              key={(item.path || '') + item.title}
              to={item.path || '/'}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-600" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 text-xs text-slate-500">
        <div className="flex items-center justify-between text-[11px]">
          <span>Status: <span className="text-emerald-600 font-semibold">Online</span></span>
          <span>v1.0 Production</span>
        </div>
      </div>
    </aside>
  );
};
