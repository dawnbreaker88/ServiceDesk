import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import {
  BarChart3,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Laptop,
  Users,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function ManagerOverview({ onNavigate }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [techReport, setTechReport] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const [dashRes, slaRes, techRes, ticketRes] = await Promise.all([
          apiRequest('/reports/dashboard'),
          apiRequest('/reports/sla'),
          apiRequest('/reports/technicians'),
          apiRequest('/reports/tickets'),
        ]);

        if (dashRes.success) setMetrics(dashRes.metrics);
        if (slaRes.success) setSlaData(slaRes);
        if (techRes.success) setTechReport(techRes.data || []);
        if (ticketRes.success) setCategoryCounts(ticketRes.categoryCounts || []);
      } catch (err) {
        console.error('Failed to load manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-mono text-[#737373] uppercase tracking-wider">
            IT Operations & Service Delivery
          </span>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#0a0a0a] tracking-tight mt-0.5">
            Operations Management Overview
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('mgr-team')}
            className="px-3.5 py-2 bg-[#ffffff] hover:bg-[#fafafa] text-[#0a0a0a] text-[13px] font-medium border border-[#e5e5e5] rounded-[8px] transition-all flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <Users className="w-4 h-4 text-[#2563eb]" />
            <span>Team Dispatch</span>
          </button>

          <button
            onClick={() => onNavigate('mgr-assets')}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Laptop className="w-4 h-4" />
            <span>Asset Inventory</span>
          </button>
        </div>
      </div>

      {/* ─── Executive KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Compliance % */}
        <div
          onClick={() => onNavigate('mgr-sla')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-semibold text-3xl text-[#0a0a0a]">
              {slaData?.complianceRate || metrics?.slaCompliancePercent || 98}%
            </span>
            <span className="text-[12px] font-medium text-emerald-600">On Target</span>
          </div>
          <div className="w-full bg-[#f5f5f5] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${slaData?.complianceRate || metrics?.slaCompliancePercent || 98}%` }}
            />
          </div>
        </div>

        {/* Active Open Tickets */}
        <div
          onClick={() => onNavigate('tech-queue')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">Open Ticket Backlog</span>
            <Layers className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div className="font-display font-semibold text-3xl text-[#0a0a0a]">
            {(metrics?.openTickets || 0) + (metrics?.inProgressTickets || 0)}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">
            {metrics?.openTickets || 0} unassigned • {metrics?.inProgressTickets || 0} in progress
          </p>
        </div>

        {/* Active Breaches */}
        <div
          onClick={() => onNavigate('mgr-sla')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">SLA Breaches</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-display font-semibold text-3xl text-red-600">
            {slaData?.breakdown?.breached || metrics?.slaBreaches || 0}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">
            {slaData?.breakdown?.warning || 0} tickets nearing threshold
          </p>
        </div>

        {/* Total Assets Managed */}
        <div
          onClick={() => onNavigate('mgr-assets')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">Managed Fleet Assets</span>
            <Laptop className="w-4 h-4 text-[#737373]" />
          </div>
          <div className="font-display font-semibold text-3xl text-[#0a0a0a]">
            {metrics?.totalAssets || 0}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">Hardware & assigned inventory</p>
        </div>
      </div>

      {/* ─── Middle Grid: Technician Team Capacity & Category Breakdown ─ */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left (60%): Technician Capacity Matrix */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Technician Workload & Capacity
              </h2>
              <p className="text-[13px] text-[#737373]">Live dispatch distribution and effort hours</p>
            </div>
            <button
              onClick={() => onNavigate('mgr-team')}
              className="text-[12px] font-medium text-[#2563eb] hover:underline flex items-center gap-1"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#f5f5f5]">
            {techReport.map((t) => (
              <div key={t.technician._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-semibold text-xs">
                    {t.technician.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#0a0a0a]">{t.technician.name}</div>
                    <div className="text-[11px] text-[#737373]">{t.technician.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[12px]">
                  <div className="text-right">
                    <span className="font-mono font-semibold text-[#0a0a0a]">
                      {t.workload.activeTotal}
                    </span>
                    <span className="text-[#737373] text-[11px]"> active</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-medium text-[#2563eb]">
                      {t.workload.totalHoursLogged}h
                    </span>
                    <span className="text-[#737373] text-[11px]"> logged</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="font-mono text-emerald-700 font-medium">
                      {t.workload.resolved}
                    </span>
                    <span className="text-[#737373] text-[11px]"> resolved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (40%): Volume by Category */}
        <div className="lg:col-span-5 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#0a0a0a]">
              Volume by Problem Category
            </h2>
            <p className="text-[13px] text-[#737373]">Ticket distribution across IT domains</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryCounts.map((cat) => {
              const maxVal = Math.max(...categoryCounts.map((c) => c.count), 1);
              const pct = Math.round((cat.count / maxVal) * 100);

              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-[#0a0a0a]">{cat._id}</span>
                    <span className="font-mono text-[#737373]">{cat.count} tickets</span>
                  </div>
                  <div className="w-full bg-[#f5f5f5] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0a0a0a] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
