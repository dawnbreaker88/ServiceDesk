import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import {
  Shield,
  Users,
  Building2,
  FolderTree,
  ShieldCheck,
  Bot,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';

export default function AdminOverview({ onNavigate }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStaff: 0,
    departmentsCount: 0,
    categoriesCount: 0,
    slaPoliciesCount: 0,
    aiConfig: null,
  });
  const [loading, setLoading] = useState(true);

  const loadAdminOverview = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes, catRes, slaRes, aiRes] = await Promise.all([
        apiRequest('/users'),
        apiRequest('/departments'),
        apiRequest('/categories'),
        apiRequest('/sla'),
        apiRequest('/ai/config').catch(() => ({ success: false })),
      ]);

      const users = usersRes.success ? usersRes.data || [] : [];
      const staff = users.filter((u) => ['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(u.role));

      setStats({
        totalUsers: users.length,
        activeStaff: staff.length,
        departmentsCount: deptRes.success ? (deptRes.data || []).length : 0,
        categoriesCount: catRes.success ? (catRes.data || []).length : 0,
        slaPoliciesCount: slaRes.success ? (slaRes.data || []).length : 0,
        aiConfig: aiRes.success ? aiRes.data : null,
      });
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, []);

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              System Administration
            </span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Operational
            </span>
          </div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Global System Console</h1>
          <p className="text-[13px] text-[#737373]">
            Manage enterprise organization, identity access, SLA policies, and operations governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-4 h-4 text-white" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* ─── Quick Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('admin-users')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-2 cursor-pointer hover:border-[#0a0a0a] transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#737373]">Total User Accounts</span>
            <Users className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#0a0a0a]">
            {loading ? '...' : stats.totalUsers}
          </div>
          <div className="text-[12px] text-[#737373] flex items-center gap-1">
            <span className="text-[#2563eb] font-semibold">{stats.activeStaff} IT Staff</span> members
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-departments')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-2 cursor-pointer hover:border-[#0a0a0a] transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#737373]">Departments</span>
            <Building2 className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#0a0a0a]">
            {loading ? '...' : stats.departmentsCount}
          </div>
          <div className="text-[12px] text-[#737373]">Company organizational units</div>
        </div>

        <div
          onClick={() => onNavigate('admin-categories')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-2 cursor-pointer hover:border-[#0a0a0a] transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#737373]">Ticket Categories</span>
            <FolderTree className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#0a0a0a]">
            {loading ? '...' : stats.categoriesCount}
          </div>
          <div className="text-[12px] text-[#737373]">Taxonomy & triage classification</div>
        </div>

        <div
          onClick={() => onNavigate('admin-sla')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-2 cursor-pointer hover:border-[#0a0a0a] transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#737373]">SLA Policy Matrix</span>
            <ShieldCheck className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a]" />
          </div>
          <div className="font-mono font-bold text-3xl text-[#0a0a0a]">
            {loading ? '...' : stats.slaPoliciesCount}
          </div>
          <div className="text-[12px] text-[#737373]">Target response & resolve rules</div>
        </div>
      </div>

      {/* ─── Governance & Quick Actions Bento ─────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-[#f5f5f5] pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
              <div>
                <h3 className="font-display font-semibold text-base text-[#0a0a0a]">
                  System Governance & Telemetry
                </h3>
                <p className="text-[12px] text-[#737373]">
                  Platform health status, enterprise security compliance, and live socket connection
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[6px] text-[11px] font-mono font-medium">
              ● Healthy Status
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
            <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373]">Database</span>
              <div className="font-mono font-bold text-emerald-700">
                MongoDB Connected
              </div>
            </div>

            <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373]">Real-time Engine</span>
              <div className="font-mono font-medium text-emerald-700">
                Socket.io Active
              </div>
            </div>

            <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373]">Security Layer</span>
              <div className="font-mono font-medium text-[#0a0a0a]">
                RBAC & JWT
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] text-[#737373]">
              All services operational with automatic audit logging and real-time event dispatching.
            </span>
            <button
              onClick={() => onNavigate('tech-queue')}
              className="text-[12px] font-medium text-[#2563eb] hover:underline flex items-center gap-1"
            >
              <span>View Dispatch Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Admin Navigation Hub */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h3 className="font-display font-semibold text-base text-[#0a0a0a]">
            Administration Hub
          </h3>

          <div className="space-y-2">
            {[
              { label: 'User Directory & RBAC Roles', page: 'admin-users', icon: Users },
              { label: 'Department Hierarchy', page: 'admin-departments', icon: Building2 },
              { label: 'Taxonomy & Categories', page: 'admin-categories', icon: FolderTree },
              { label: 'SLA Policy Matrix', page: 'admin-sla', icon: ShieldCheck },
              { label: 'Global Audit Trail', page: 'mgr-audit', icon: Activity },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className="w-full p-2.5 rounded-[8px] bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#e5e5e5] flex items-center justify-between text-[12px] font-medium text-[#0a0a0a] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#737373]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
