import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Layers,
  BookOpen,
  Laptop,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LifeBuoy,
  LayoutDashboard,
  Clock,
  ShieldCheck,
  BarChart3,
  Settings,
  Users,
  AlertOctagon,
} from 'lucide-react';

export default function AppShell({ activePage, setActivePage, children }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Define navigation by role
  const getNavItems = () => {
    const role = user?.role || 'EMPLOYEE';

    if (role === 'MANAGER' || role === 'ADMIN' || role === 'ASSET_MANAGER') {
      return [
        { id: 'mgr-overview', label: 'Operations Overview', icon: LayoutDashboard },
        { id: 'tech-queue', label: 'Ticket Dispatch', icon: Layers },
        { id: 'mgr-assets', label: 'Asset Fleet', icon: Laptop },
        { id: 'mgr-sla', label: 'SLA Monitor', icon: ShieldCheck },
        { id: 'mgr-team', label: 'Team Capacity', icon: Users },
        { id: 'mgr-audit', label: 'Audit Trail', icon: BarChart3 },
        { id: 'guides', label: 'Knowledge Base', icon: BookOpen },
      ];
    }

    if (role === 'TECHNICIAN') {
      return [
        { id: 'tech-dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'tech-queue', label: 'Ticket Queue', icon: Layers },
        { id: 'tech-worklogs', label: 'Work Logs', icon: Clock },
        { id: 'mgr-assets', label: 'Hardware Assets', icon: Laptop },
        { id: 'guides', label: 'Knowledge Base', icon: BookOpen },
      ];
    }

    // Default Employee
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'support', label: 'Get Support', icon: LifeBuoy },
      { id: 'tickets', label: 'My Tickets', icon: Layers },
      { id: 'guides', label: 'Guides', icon: BookOpen },
      { id: 'devices', label: 'My Devices', icon: Laptop },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-[#171717]">
      {/* ─── Collapsible Left Sidebar ─────────────────────────────────── */}
      <aside
        className={`bg-[#ffffff] border-r border-[#e5e5e5] flex flex-col justify-between transition-all duration-200 z-30 sticky top-0 h-screen ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 border-b border-[#e5e5e5] flex items-center justify-between px-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] flex-shrink-0 flex items-center justify-center text-white font-mono text-xs font-semibold">
                SD
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-display font-semibold text-[14px] text-[#0a0a0a] leading-tight">
                    ServiceDesk
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                    {user?.role?.replace('_', ' ') || 'Workspace'}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-6 h-6 rounded flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#fafafa]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#2563eb]' : 'text-[#737373]'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Section */}
        <div className="p-3 border-t border-[#e5e5e5]">
          <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#fafafa] border border-[#e5e5e5]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white flex-shrink-0 flex items-center justify-center font-semibold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-[12px] font-medium text-[#0a0a0a] truncate">{user?.name}</span>
                  <span className="text-[10px] font-mono text-[#737373]">{user?.role}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={logout}
                className="p-1.5 text-[#737373] hover:text-red-600 rounded hover:bg-[#ffffff] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#ffffff] border-b border-[#e5e5e5] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#737373]">Workspace</span>
            <span className="text-[#a3a3a3]">/</span>
            <span className="text-[13px] font-medium text-[#0a0a0a] capitalize">
              {navItems.find((n) => n.id === activePage)?.label || activePage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {user?.role}
            </span>
            <span className="text-[12px] font-mono text-[#737373] bg-[#f5f5f5] px-2.5 py-1 rounded border border-[#e5e5e5]">
              {user?.department?.name || 'Enterprise'}
            </span>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1240px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
