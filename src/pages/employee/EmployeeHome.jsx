import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTickets } from '../../api/ticketApi';
import CreateManualTicketModal from '../../components/tickets/CreateManualTicketModal';
import { ArrowRight, MessageSquare, Layers, Laptop, BookOpen, AlertCircle, Plus } from 'lucide-react';

export default function EmployeeHome({ onNavigateToSupport, onSelectTicket, onNavigateToGuides }) {
  const { user } = useAuth();
  const [problemQuery, setProblemQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);

  const loadTickets = async () => {
    try {
      const res = await getTickets({ limit: 5 });
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
  }, []);

  const handleStartSupport = (e) => {
    e.preventDefault();
    if (!problemQuery.trim()) return;
    onNavigateToSupport(problemQuery);
  };

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
    <div className="space-y-10">
      {/* ─── Greeting & Input Section ─────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[720px]">
          <span className="text-[12px] font-mono text-[#737373] uppercase tracking-wider">
            Employee Helpdesk
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-[#0a0a0a] tracking-tight mt-1 mb-3">
            Good day, {user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-[15px] text-[#525252] leading-relaxed mb-6">
            What can we help you with? Describe what is wrong and we will guide you through fixing it or connect you with IT.
          </p>

          <form onSubmit={handleStartSupport} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={problemQuery}
              onChange={(e) => setProblemQuery(e.target.value)}
              placeholder="e.g. My laptop cannot connect to Corp-Secure Wi-Fi..."
              className="flex-1 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>Get Support</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#737373]">
            <span>Need to file a direct request without chat?</span>
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="font-medium text-[#2563eb] hover:underline"
            >
              Create Ticket Manually →
            </button>
          </div>
        </div>
      </div>

      {/* ─── Active Tickets List ──────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#0a0a0a]">Your Tickets</h2>
            <p className="text-[13px] text-[#737373]">Track status and responses from IT</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowManualModal(true)}
              className="text-[13px] font-medium text-[#0a0a0a] bg-[#f5f5f5] hover:bg-[#eaeaea] px-3 py-1.5 rounded-[8px] border border-[#e5e5e5] flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Manual Ticket</span>
            </button>
            <button
              onClick={() => onNavigateToSupport('')}
              className="text-[13px] font-medium text-[#2563eb] hover:underline flex items-center gap-1"
            >
              <span>+ Get Support</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#737373] text-[13px]">
            Loading your support requests...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#e5e5e5] rounded-[12px] bg-[#fafafa]">
            <Layers className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No active support tickets</h3>
            <p className="text-[13px] text-[#737373] max-w-[360px] mx-auto mb-4">
              Everything is running smoothly! If you encounter any technical difficulty, start a support session.
            </p>
            <button
              onClick={() => onNavigateToSupport('')}
              className="px-4 py-2 text-[13px] font-medium text-[#171717] bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] hover:bg-[#f5f5f5]"
            >
              Get Support
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f5]">
            {tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => onSelectTicket(t._id)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafafa] -mx-4 px-4 rounded-[8px] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[12px] text-[#525252] bg-[#f5f5f5] px-2 py-0.5 rounded border border-[#e5e5e5]">
                    {t.ticketNumber}
                  </span>
                  <div className="truncate">
                    <span className="text-[14px] font-medium text-[#0a0a0a] hover:text-[#2563eb] transition-colors truncate block">
                      {t.title}
                    </span>
                    <span className="text-[12px] text-[#737373]">
                      {t.category?.name || 'General'} • {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-medium border ${getStatusBadgeClass(t.status)}`}>
                    ● {t.status.replace('_', ' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#a3a3a3]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Self-Service Quick Shortcuts ─────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div
          onClick={onNavigateToGuides}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all"
        >
          <BookOpen className="w-5 h-5 text-[#0a0a0a] mb-2" />
          <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Troubleshooting Guides</h3>
          <p className="text-[12px] text-[#737373]">Self-service fixes for Wi-Fi, VPN, and Passwords.</p>
        </div>

        <div
          onClick={() => onNavigateToSupport('Wi-Fi connection problem')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all"
        >
          <Laptop className="w-5 h-5 text-[#0a0a0a] mb-2" />
          <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Wi-Fi & Network Issues</h3>
          <p className="text-[12px] text-[#737373]">Step-by-step diagnostic checklist for connectivity.</p>
        </div>

        <div
          onClick={() => onNavigateToSupport('Password expired or account locked')}
          className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] p-5 hover:border-[#d4d4d4] cursor-pointer transition-all"
        >
          <AlertCircle className="w-5 h-5 text-[#0a0a0a] mb-2" />
          <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Account & SSO Access</h3>
          <p className="text-[12px] text-[#737373]">Unlock corporate identity or reset credentials.</p>
        </div>
      </div>

      {/* Manual Ticket Creation Modal */}
      <CreateManualTicketModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onTicketCreated={(ticketId) => {
          onSelectTicket(ticketId);
        }}
      />
    </div>
  );
}
