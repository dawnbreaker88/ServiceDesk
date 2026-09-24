import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTickets } from '../../api/ticketApi';
import {
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Zap,
  Flame,
} from 'lucide-react';

export default function TechDashboard({ onNavigateToQueue, onSelectTicket }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedToMe: 0,
    unassigned: 0,
    approachingSla: 0,
    breachedSla: 0,
    resolvedToday: 0,
  });
  const [myTickets, setMyTickets] = useState([]);
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [myRes, allRes] = await Promise.all([
          getTickets({ assignee: user?._id, limit: 10 }),
          getTickets({ limit: 50 }),
        ]);

        if (myRes.success && allRes.success) {
          const all = allRes.data || [];
          const mine = myRes.data || [];

          setMyTickets(mine.filter((t) => !['CLOSED', 'RESOLVED'].includes(t.status)));

          const urgent = all.filter(
            (t) =>
              t.priority === 'CRITICAL' ||
              t.slaStatus === 'APPROACHING_DEADLINE' ||
              t.slaStatus === 'BREACHED'
          );
          setUrgentTickets(urgent.slice(0, 5));

          setStats({
            assignedToMe: mine.filter((t) => !['CLOSED', 'RESOLVED'].includes(t.status)).length,
            unassigned: all.filter((t) => !t.assignee && t.status === 'OPEN').length,
            approachingSla: all.filter((t) => t.slaStatus === 'APPROACHING_DEADLINE').length,
            breachedSla: all.filter((t) => t.slaStatus === 'BREACHED').length,
            resolvedToday: all.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
          });
        }
      } catch (err) {
        console.error('Failed to load technician dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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

  const getSlaBadge = (slaStatus) => {
    if (slaStatus === 'BREACHED') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
          <Flame className="w-3 h-3 text-red-600" /> BREACHED
        </span>
      );
    }
    if (slaStatus === 'APPROACHING_DEADLINE') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" /> &lt; 1H REMAINING
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#737373] bg-[#fafafa] border border-[#e5e5e5]">
        ON TRACK
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* ─── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-mono text-[#737373] uppercase tracking-wider">
            Technician Command Center
          </span>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#0a0a0a] tracking-tight mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'Technician'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToQueue('unassigned')}
            className="px-3.5 py-2 bg-[#ffffff] hover:bg-[#fafafa] text-[#0a0a0a] text-[13px] font-medium border border-[#e5e5e5] rounded-[8px] transition-all flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <span>Unassigned Pool</span>
            <span className="bg-[#0a0a0a] text-white text-[11px] font-mono px-2 py-0.5 rounded-full">
              {stats.unassigned}
            </span>
          </button>

          <button
            onClick={() => onNavigateToQueue('all')}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Open Ticket Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Metric KPI Bento Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateToQueue('assignedToMe')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">My Active Queue</span>
            <UserCheck className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div className="font-display font-semibold text-3xl text-[#0a0a0a]">
            {stats.assignedToMe}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">Assigned directly to you</p>
        </div>

        <div
          onClick={() => onNavigateToQueue('unassigned')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">Unassigned Tickets</span>
            <Layers className="w-4 h-4 text-[#737373]" />
          </div>
          <div className="font-display font-semibold text-3xl text-[#0a0a0a]">
            {stats.unassigned}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">Awaiting technician pickup</p>
        </div>

        <div
          onClick={() => onNavigateToQueue('urgent')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">SLA Warning / Breached</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-display font-semibold text-3xl text-red-600">
            {stats.approachingSla + stats.breachedSla}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">
            {stats.breachedSla} breached • {stats.approachingSla} nearing deadline
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#737373] mb-3">
            <span className="text-[12px] font-mono uppercase">Resolved Overview</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-semibold text-3xl text-[#0a0a0a]">
            {stats.resolvedToday}
          </div>
          <p className="text-[12px] text-[#737373] mt-1">Resolved across the fleet</p>
        </div>
      </div>

      {/* ─── Urgent & Critical SLA Warning Feed ─────────────────────── */}
      {urgentTickets.length > 0 && (
        <div className="bg-red-50/60 border border-red-200 rounded-[16px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-900 font-semibold text-[14px]">
              <Flame className="w-4 h-4 text-red-600" />
              <span>Critical & Urgent SLA Attention Required</span>
            </div>
            <button
              onClick={() => onNavigateToQueue('urgent')}
              className="text-[12px] font-medium text-red-700 hover:underline flex items-center gap-1"
            >
              <span>View all urgent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {urgentTickets.map((t) => (
              <div
                key={t._id}
                onClick={() => onSelectTicket(t._id)}
                className="p-3.5 bg-white border border-red-200 hover:border-red-400 rounded-[10px] cursor-pointer transition-all shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-bold text-[#0a0a0a]">
                    {t.ticketNumber}
                  </span>
                  {getSlaBadge(t.slaStatus)}
                </div>
                <div className="text-[13px] font-medium text-[#0a0a0a] truncate">{t.title}</div>
                <div className="flex items-center justify-between text-[11px] text-[#737373]">
                  <span>By {t.requester?.name}</span>
                  <span className={`px-2 py-0.5 rounded font-mono ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── My Active Assigned Tickets ─────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#0a0a0a]">
              My Active Assigned Tickets
            </h2>
            <p className="text-[13px] text-[#737373]">
              Tickets currently assigned to you awaiting response or work completion
            </p>
          </div>
          <button
            onClick={() => onNavigateToQueue('assignedToMe')}
            className="text-[13px] font-medium text-[#2563eb] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#737373] text-[13px]">
            Loading assigned workload...
          </div>
        ) : myTickets.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#e5e5e5] rounded-[12px] bg-[#fafafa]">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Queue is clear!</h3>
            <p className="text-[13px] text-[#737373] max-w-[360px] mx-auto mb-4">
              You currently have no open tickets assigned to you. Pick up unassigned tickets from the queue.
            </p>
            <button
              onClick={() => onNavigateToQueue('unassigned')}
              className="px-4 py-2 text-[13px] font-medium bg-[#0a0a0a] text-white rounded-[8px]"
            >
              Browse Unassigned Tickets
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f5]">
            {myTickets.map((t) => (
              <div
                key={t._id}
                onClick={() => onSelectTicket(t._id)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafafa] -mx-4 px-4 rounded-[8px] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[12px] font-semibold text-[#0a0a0a] bg-[#f5f5f5] px-2.5 py-1 rounded border border-[#e5e5e5]">
                    {t.ticketNumber}
                  </span>
                  <div className="truncate">
                    <span className="text-[14px] font-medium text-[#0a0a0a] hover:text-[#2563eb] transition-colors truncate block">
                      {t.title}
                    </span>
                    <span className="text-[12px] text-[#737373]">
                      Requester: {t.requester?.name} ({t.requester?.department?.name || 'Staff'}) •{' '}
                      {t.category?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-mono font-medium border ${getPriorityBadge(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>
                  {getSlaBadge(t.slaStatus)}
                  <ArrowRight className="w-4 h-4 text-[#a3a3a3]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
