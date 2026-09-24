import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTickets } from '../../api/ticketApi';
import { apiRequest } from '../../api/client';
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Flame,
  UserCheck,
  UserPlus,
  Laptop,
  CheckCircle2,
  RefreshCw,
  X,
  Shield,
  Briefcase,
} from 'lucide-react';

export default function TechQueue({ onSelectTicket, initialTab = 'all' }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); // 'all' | 'assignedToMe' | 'unassigned' | 'urgent'
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  // Assign modal for Managers & Admins
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [dispatching, setDispatching] = useState(false);

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (filterPriority !== 'ALL') params.priority = filterPriority;

      if (activeTab === 'assignedToMe') {
        params.assignee = user?._id;
      }

      const [ticketRes, userRes] = await Promise.all([
        getTickets(params),
        apiRequest('/users'),
      ]);

      if (ticketRes.success) {
        let list = ticketRes.data || [];

        if (activeTab === 'unassigned') {
          list = list.filter((t) => !t.assignee && t.status === 'OPEN');
        } else if (activeTab === 'urgent') {
          list = list.filter(
            (t) =>
              t.priority === 'CRITICAL' ||
              t.slaStatus === 'APPROACHING_DEADLINE' ||
              t.slaStatus === 'BREACHED'
          );
        }

        if (filterCategory !== 'ALL') {
          list = list.filter((t) => t.category?.name === filterCategory || t.category?.code === filterCategory);
        }

        setTickets(list);
      }

      if (userRes.success) {
        const techs = (userRes.data || []).filter(
          (u) => ['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(u.role) && u.status === 'ACTIVE'
        );
        setTechnicians(techs);
      }
    } catch (err) {
      console.error('Failed to load tickets in tech queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterPriority, filterCategory, search]);

  // One-click claim / assign to myself (Technicians)
  const handleClaimTicket = async (e, ticketId) => {
    e.stopPropagation();
    setClaimingId(ticketId);
    try {
      await apiRequest(`/tickets/${ticketId}/start`, { method: 'POST' });
      await loadData();
    } catch (err) {
      alert('Failed to claim ticket: ' + err.message);
    } finally {
      setClaimingId(null);
    }
  };

  // Dispatch / Assign Ticket to selected technician (Manager / Admin)
  const handleDispatchTicket = async (e) => {
    e.preventDefault();
    if (!assigningTicket || !selectedTechId) return;

    setDispatching(true);
    try {
      const res = await apiRequest(`/tickets/${assigningTicket._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: selectedTechId }),
      });

      if (res.success) {
        setAssigningTicket(null);
        setSelectedTechId('');
        await loadData();
      }
    } catch (err) {
      alert('Failed to dispatch ticket: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'REOPENED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
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
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">
            {isManagerOrAdmin ? 'Ticket Dispatch & Triage Hub' : 'Ticket Dispatch Queue'}
          </h1>
          <p className="text-[13px] text-[#737373]">
            {isManagerOrAdmin
              ? 'Review queues, balance technician workload, and dispatch requests'
              : 'Triage, investigate, claim, and resolve employee requests'}
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-[#737373] hover:text-[#0a0a0a] bg-white border border-[#e5e5e5] rounded-[8px] hover:bg-[#fafafa] transition-colors self-start sm:self-auto flex items-center gap-1.5 text-[12px] font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ─── Queue Scope Tabs & Filter Bar ──────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-3 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f5f5f5] pb-3">
          {/* Main Scope Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'All Open Tickets' },
              { id: 'assignedToMe', label: isManagerOrAdmin ? 'My Assigned' : 'Assigned to Me' },
              { id: 'unassigned', label: 'Unassigned Pool' },
              { id: 'urgent', label: 'SLA Warnings & Critical' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket # or keyword..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
            />
          </div>
        </div>

        {/* Sub Filters: Priority & Category */}
        <div className="flex items-center gap-3 text-[12px]">
          <span className="font-mono text-[#737373] uppercase text-[10px]">Filter Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filterPriority === p
                  ? 'bg-[#2563eb] text-white font-medium'
                  : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Queue Tickets Table ────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[13px] text-[#737373]">
            Loading ticket queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No tickets match this view</h3>
            <p className="text-[13px] text-[#737373]">All tickets in this view are clear or resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject & Context</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">{isManagerOrAdmin ? 'Dispatch' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => onSelectTicket(t._id)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0a0a0a] whitespace-nowrap">
                      {t.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-[#0a0a0a] truncate">{t.title}</div>
                      <div className="text-[11px] text-[#737373] flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-[#f5f5f5] px-1.5 py-0.5 rounded border border-[#e5e5e5]">
                          {t.category?.name || 'General'}
                        </span>
                        {t.asset && (
                          <span className="flex items-center gap-1 text-[#525252]">
                            <Laptop className="w-3 h-3" />
                            <span>{t.asset.name}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#0a0a0a] whitespace-nowrap">
                      <div className="font-medium text-[12px]">{t.requester?.name || 'User'}</div>
                      <div className="text-[11px] text-[#737373]">{t.requester?.department?.name || 'Staff'}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-medium border ${getStatusBadge(t.status)}`}>
                        ● {t.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSlaBadge(t.slaStatus)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#525252]">
                      {t.assignee?.name ? (
                        <span className="font-medium text-[#0a0a0a]">{t.assignee.name}</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-mono">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isManagerOrAdmin ? (
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setAssigningTicket(t);
                              setSelectedTechId(t.assignee?._id || '');
                            }}
                            className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[11px] font-medium rounded-[6px] transition-all inline-flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>{t.assignee ? 'Reassign' : 'Assign Tech'}</span>
                          </button>
                        </div>
                      ) : !t.assignee ? (
                        <button
                          onClick={(e) => handleClaimTicket(e, t._id)}
                          disabled={claimingId === t._id}
                          className="px-3 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[12px] font-medium rounded-[6px] transition-all inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>{claimingId === t._id ? 'Claiming...' : 'Claim'}</span>
                        </button>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#a3a3a3] inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Manager Assign / Reassign Modal ───────────────────────── */}
      {assigningTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2563eb]" />
                <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                  Dispatch Ticket {assigningTicket.ticketNumber}
                </h3>
              </div>
              <button
                onClick={() => setAssigningTicket(null)}
                className="text-[#737373] hover:text-[#0a0a0a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5] text-[12px] space-y-1">
              <div className="font-medium text-[#0a0a0a]">{assigningTicket.title}</div>
              <div className="text-[#737373] flex items-center gap-2">
                <span>Priority: <strong className="font-mono text-[#0a0a0a]">{assigningTicket.priority}</strong></span>
                <span>•</span>
                <span>Category: {assigningTicket.category?.name || 'General'}</span>
              </div>
            </div>

            <form onSubmit={handleDispatchTicket} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-2">
                  Select Assignee / Technician
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto border border-[#e5e5e5] rounded-[8px] p-2 bg-[#fafafa]">
                  {technicians.map((tech) => (
                    <label
                      key={tech._id}
                      className={`flex items-center justify-between p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                        selectedTechId === tech._id
                          ? 'bg-blue-50/70 border-[#2563eb] text-[#0a0a0a]'
                          : 'bg-white border-[#e5e5e5] hover:bg-[#fafafa] text-[#525252]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="assignedTech"
                          value={tech._id}
                          checked={selectedTechId === tech._id}
                          onChange={() => setSelectedTechId(tech._id)}
                          className="text-[#2563eb] focus:ring-0"
                        />
                        <div>
                          <div className="font-medium text-[13px] text-[#0a0a0a]">{tech.name}</div>
                          <div className="text-[11px] text-[#737373]">{tech.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {tech.role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f5f5]">
                <button
                  type="button"
                  onClick={() => setAssigningTicket(null)}
                  className="px-4 py-2 text-[13px] border border-[#e5e5e5] rounded-[8px] text-[#525252] hover:bg-[#fafafa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || !selectedTechId}
                  className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all"
                >
                  {dispatching ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

