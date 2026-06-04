import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Car, Ticket, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/floors', icon: Layers, label: 'Floors' },
  { to: '/vehicles', icon: Car, label: 'Vehicle Types' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>ParkEase</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">v1.0.0 · ParkEase</p>
      </div>
    </aside>
  );
}
