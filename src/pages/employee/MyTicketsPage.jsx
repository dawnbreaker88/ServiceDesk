import React, { useState, useEffect } from 'react';
import { getTickets } from '../../api/ticketApi';
import CreateManualTicketModal from '../../components/tickets/CreateManualTicketModal';
import { Layers, ArrowRight, Search, Filter, Plus, MessageSquare } from 'lucide-react';

export default function MyTicketsPage({ onSelectTicket, onNavigateToSupport }) {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (search) params.search = search;

      const res = await getTickets(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filterStatus, search]);

  const getStatusBadgeClass = (status) => {
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

  return (
    <div className="space-y-6">
      {/* ─── Header & Action ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">My Tickets</h1>
          <p className="text-[13px] text-[#737373]">
            Track progress, respond to technicians, and confirm resolutions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 bg-[#f5f5f5] hover:bg-[#eaeaea] text-[#0a0a0a] text-[13px] font-medium rounded-[8px] border border-[#e5e5e5] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Create Manually</span>
          </button>
          <button
            onClick={() => onNavigateToSupport('')}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Support Triage</span>
          </button>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                filterStatus === st
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      {/* ─── Tickets Table ───────────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-[#737373]">
            Loading support requests...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No tickets match criteria</h3>
            <p className="text-[13px] text-[#737373]">Try resetting your filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => onSelectTicket(t._id)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-[#0a0a0a]">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a] max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.category?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-medium border ${getStatusBadgeClass(t.status)}`}>
                        ● {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.assignee?.name || <span className="text-[#a3a3a3]">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-[#737373] font-mono text-[11px]">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ArrowRight className="w-4 h-4 text-[#a3a3a3] inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Ticket Creation Modal */}
      <CreateManualTicketModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onTicketCreated={(newTicketId) => {
          onSelectTicket(newTicketId);
        }}
      />
    </div>
  );
}
