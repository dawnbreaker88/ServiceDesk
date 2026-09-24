import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getTicketById, addComment, resolveTicket } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../api/client';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import {
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  Clock,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  User,
  Shield,
  FileText,
  Paperclip,
  Upload,
  Flame,
  Check,
  Zap,
  UserCheck,
} from 'lucide-react';

import { useSocket } from '../../context/SocketContext';

export default function TechTicketWorkstation({ ticketId, onBack }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { socket } = useSocket();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const isManagerOrAdmin = user && ['MANAGER', 'ADMIN', 'ASSET_MANAGER'].includes(user.role);

  // Message & Internal Note states
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PUBLIC' | 'INTERNAL'
  const [isInternal, setIsInternal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Time tracking stopwatch state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMinutes, setLogMinutes] = useState(15);
  const [logDescription, setLogDescription] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Manager action states
  const [reassigning, setReassigning] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const loadTicket = async () => {
    try {
      const [tRes, uRes] = await Promise.all([
        getTicketById(ticketId),
        apiRequest('/users'),
      ]);

      if (tRes.success && tRes.data) {
        setTicket(tRes.data);
        setComments(tRes.data.comments || []);
        setWorkLogs(tRes.data.workLogs || []);
      }

      if (uRes.success) {
        // Strictly only show TECHNICIAN accounts
        setTechnicians(
          (uRes.data || []).filter(
            (u) => u.role === 'TECHNICIAN' && u.status === 'ACTIVE'
          )
        );
      }
    } catch (err) {
      console.error('Failed to load workstation ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignTech = async (techId) => {
    if (!techId) return;
    setReassigning(true);
    try {
      const res = await apiRequest(`/tickets/${ticketId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: techId }),
      });
      if (res.success) {
        toast.success('Technician successfully reassigned');
        await loadTicket();
      }
    } catch (err) {
      toast.error('Failed to reassign technician: ' + err.message);
    } finally {
      setReassigning(false);
    }
  };

  const handleEscalatePriority = async (newPriority) => {
    if (!newPriority || newPriority === ticket?.priority) return;
    setUpdatingPriority(true);
    try {
      const res = await apiRequest(`/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.success) {
        toast.success(`Priority updated to ${newPriority}`);
        await loadTicket();
      }
    } catch (err) {
      toast.error('Failed to update priority: ' + err.message);
    } finally {
      setUpdatingPriority(false);
    }
  };

  useEffect(() => {
    if (ticketId) loadTicket();
  }, [ticketId]);

  // Real-time socket room and event listeners for workstation
  useEffect(() => {
    if (!socket || !ticketId) return;

    socket.emit('join_ticket', ticketId);

    const onCommentAdded = ({ comment }) => {
      if (comment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === comment._id)) return prev;
          return [...prev, comment];
        });
      }
    };

    const onWorkLogAdded = ({ workLog }) => {
      if (workLog) {
        setWorkLogs((prev) => {
          if (prev.some((w) => w._id === workLog._id)) return prev;
          return [workLog, ...prev];
        });
      }
    };

    const onTicketUpdated = (updated) => {
      if (updated && updated._id === ticketId) {
        setTicket(updated);
      }
    };

    socket.on('ticket:comment', onCommentAdded);
    socket.on('ticket:worklog', onWorkLogAdded);
    socket.on('ticket:updated', onTicketUpdated);

    return () => {
      socket.emit('leave_ticket', ticketId);
      socket.off('ticket:comment', onCommentAdded);
      socket.off('ticket:worklog', onWorkLogAdded);
      socket.off('ticket:updated', onTicketUpdated);
    };
  }, [socket, ticketId]);

  // Live stopwatch effect
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start work if not already in progress
  const handleStartWork = async () => {
    try {
      await apiRequest(`/tickets/${ticketId}/start`, { method: 'POST' });
      setTimerRunning(true);
      toast.success('Ticket marked In Progress. Stopwatch timer started.');
      await loadTicket();
    } catch (err) {
      toast.error('Failed to start ticket: ' + err.message);
    }
  };

  // Submit public comment or internal note
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && attachments.length === 0) return;

    setSubmittingComment(true);
    try {
      const res = await addComment(ticketId, {
        message: messageText.trim(),
        isInternal,
        attachments,
      });

      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
        setMessageText('');
        setAttachments([]);
        toast.success(isInternal ? 'Internal note added' : 'Public reply sent');
      }
    } catch (err) {
      toast.error('Failed to send message: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // File upload handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            url: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Log manual work time
  const handleLogWork = async (e) => {
    e.preventDefault();
    if (!logDescription.trim() || !logMinutes) return;

    setSubmittingLog(true);
    try {
      const res = await apiRequest(`/tickets/${ticketId}/worklogs`, {
        method: 'POST',
        body: JSON.stringify({
          durationMinutes: Number(logMinutes),
          description: logDescription.trim(),
        }),
      });

      if (res.success && res.data) {
        setWorkLogs((prev) => [res.data, ...prev]);
        setShowLogModal(false);
        setLogDescription('');
        setTimerSeconds(0);
        setTimerRunning(false);
        toast.success(`Logged ${logMinutes} minutes of work`);
      }
    } catch (err) {
      toast.error('Failed to record work log: ' + err.message);
    } finally {
      setSubmittingLog(false);
    }
  };

  // Submit resolution
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) return;

    setSubmittingResolution(true);
    try {
      const res = await resolveTicket(ticketId, resolutionSummary.trim());
      if (res.success) {
        setShowResolveModal(false);
        toast.success('Ticket marked as Resolved');
        await loadTicket();
      }
    } catch (err) {
      toast.error('Failed to resolve ticket: ' + err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (activeTab === 'PUBLIC') return !c.isInternal;
    if (activeTab === 'INTERNAL') return c.isInternal;
    return true;
  });

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

  if (loading) {
    return <div className="py-20 text-center text-[#737373] text-[13px]">Loading workstation...</div>;
  }

  if (!ticket) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 text-[14px] mb-4">Ticket not found or accessible.</p>
        <button onClick={onBack} className="px-4 py-2 border rounded-[8px] text-[13px]">
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Workstation Command Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#737373] hover:text-[#0a0a0a] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[14px] font-bold bg-[#0a0a0a] text-white px-2.5 py-1 rounded">
              {ticket.ticketNumber}
            </span>
            <h1 className="font-display font-semibold text-2xl text-[#0a0a0a]">{ticket.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <button
              onClick={handleStartWork}
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-medium rounded-[8px] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Investigation</span>
            </button>
          )}

          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-medium rounded-[8px] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Timeline Bar ────────────────────────────────────────────── */}
      <TicketTimeline ticket={ticket} />

      {/* ─── Split Screen: Communication Hub vs Context & Actions ───── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65%): Dual-Mode Conversation & Notes Hub */}
        <div className="lg:col-span-8 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Issue Summary */}
          <div className="p-5 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#737373]">
                Issue Description & Diagnostics
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
            </div>
            <div className="text-[14px] text-[#171717] leading-relaxed prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => <h3 className="font-semibold text-[14px] text-[#0a0a0a] mt-3 mb-1 first:mt-0">{children}</h3>,
                  h4: ({ children }) => <h4 className="font-semibold text-[13px] text-[#0a0a0a] mt-2 mb-1">{children}</h4>,
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[#262626]">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2 text-[#262626]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2 text-[#262626]">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-[#0a0a0a]">{children}</strong>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-[#f0f0f0] border border-[#e5e5e5] rounded text-[12px] font-mono text-[#0a0a0a]">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-3 bg-[#0a0a0a] text-[#fafafa] rounded-[8px] text-[12px] font-mono overflow-x-auto my-2">
                      {children}
                    </pre>
                  ),
                }}
              >
                {ticket.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Tab Filter Header: All vs Public vs Internal Notes */}
          <div className="px-5 py-2.5 bg-[#ffffff] border-b border-[#e5e5e5] flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: `All Activity (${comments.length})` },
                { id: 'PUBLIC', label: 'Requester Chat' },
                { id: 'INTERNAL', label: '🔒 Internal Notes' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#0a0a0a] text-white'
                      : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-[#737373]">
              {ticket.requester?.name} &lt;{ticket.requester?.email}&gt;
            </span>
          </div>

          {/* Activity Stream */}
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
            {filteredComments.length === 0 ? (
              <div className="py-12 text-center text-[#737373] text-[13px]">
                No messages or notes matching this filter yet.
              </div>
            ) : (
              filteredComments.map((c) => {
                const isInternalNote = c.isInternal;
                const isMe = c.author?._id === user?._id;

                return (
                  <div
                    key={c._id}
                    className={`p-4 rounded-[12px] text-[13px] leading-relaxed border transition-all ${
                      isInternalNote
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : isMe
                        ? 'bg-[#fafafa] border-[#e5e5e5] text-[#0a0a0a]'
                        : 'bg-blue-50/40 border-blue-200 text-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-black/5 text-[11px]">
                      <div className="flex items-center gap-2">
                        {isInternalNote && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> INTERNAL NOTE
                          </span>
                        )}
                        <span className="font-semibold">{c.author?.name}</span>
                        <span className="font-mono text-[#737373]">({c.author?.role})</span>
                      </div>
                      <span className="font-mono text-[#737373]">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-[13px]">{c.message}</div>

                    {c.attachments && c.attachments.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-black/5 flex flex-wrap gap-2">
                        {c.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-medium bg-white px-2 py-1 rounded border border-[#e5e5e5] flex items-center gap-1 hover:border-[#0a0a0a]"
                          >
                            <Paperclip className="w-3 h-3 text-[#737373]" />
                            <span className="underline">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Unified Composer Box with Internal vs Public Toggle */}
          {ticket.status !== 'CLOSED' && (
            <div className="p-4 border-t border-[#e5e5e5] bg-[#ffffff] space-y-3">
              <div className="flex items-center justify-between">
                {/* Mode Selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all ${
                      !isInternal
                        ? 'bg-[#0a0a0a] text-white'
                        : 'text-[#525252] bg-[#f5f5f5] hover:text-[#0a0a0a]'
                    }`}
                  >
                    Public Reply to Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                      isInternal
                        ? 'bg-amber-600 text-white'
                        : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Private Internal Note</span>
                  </button>
                </div>

                <label className="text-[12px] font-medium text-[#2563eb] hover:underline cursor-pointer flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach file</span>
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Attachments preview list */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-[#fafafa] rounded-[6px] border border-[#e5e5e5]">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-[11px] bg-white px-2 py-1 rounded border border-[#e5e5e5]">
                      <FileText className="w-3 h-3 text-[#737373]" />
                      <span className="truncate max-w-[140px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-red-500 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <textarea
                  rows="3"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'Write a private note (only visible to IT technicians & managers)...'
                      : 'Write a public response to the employee...'
                  }
                  className={`flex-1 p-3 border rounded-[8px] text-[13px] focus:outline-none transition-all ${
                    isInternal
                      ? 'bg-amber-50/40 border-amber-300 focus:border-amber-600 text-amber-950'
                      : 'bg-[#fafafa] border-[#e5e5e5] focus:border-[#0a0a0a]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={submittingComment || (!messageText.trim() && attachments.length === 0)}
                  className={`px-5 rounded-[8px] text-[13px] font-medium text-white transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-40 ${
                    isInternal ? 'bg-amber-700 hover:bg-amber-800' : 'bg-[#0a0a0a] hover:bg-[#262626]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isInternal ? 'Save Note' : 'Send'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column (35%): SLA Timer, Work Logger, Asset & User Context */}
        <div className="lg:col-span-4 space-y-4">
          {/* Manager Operations & Escalation Card */}
          {isManagerOrAdmin && (
            <div className="bg-[#ffffff] border border-blue-200 rounded-[16px] p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[12px] font-mono uppercase text-[#2563eb] font-semibold">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Manager Controls
                </span>
                <span className="bg-blue-50 px-2 py-0.5 rounded text-[10px] text-blue-700">Dispatch & SLA</span>
              </div>

              {/* Assign / Reassign Tech Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#737373] block">
                  Assignee / Technician
                </label>
                <select
                  disabled={reassigning}
                  value={ticket.assignee?._id || ''}
                  onChange={(e) => handleReassignTech(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[12px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                >
                  <option value="">-- Unassigned --</option>
                  {technicians.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Escalation */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[#737373] block">
                  Priority & SLA Escalation
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={updatingPriority}
                      onClick={() => handleEscalatePriority(p)}
                      className={`py-1 text-[10px] font-mono font-semibold rounded border transition-all ${
                        ticket.priority === p
                          ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                          : 'bg-[#fafafa] text-[#525252] border-[#e5e5e5] hover:bg-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live SLA Countdown Card */}
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

            <div className="flex items-center justify-between text-[12px] font-mono uppercase text-[#737373]">
              <span>SLA Target Deadlines</span>
              {ticket.slaStatus === 'BREACHED' ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> BREACHED
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> NORMAL
                </span>
              )}
            </div>

            <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#737373]">Response Deadline</span>
                <span className="font-mono font-medium text-[#0a0a0a]">
                  {ticket.responseDeadline ? new Date(ticket.responseDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Resolution Deadline</span>
                <span className="font-mono font-medium text-[#0a0a0a]">
                  {ticket.resolutionDeadline ? new Date(ticket.resolutionDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Time Tracking & Work Log Tracker */}
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-mono uppercase text-[#737373]">Technician Time Tracker</span>
              <button
                onClick={() => setShowLogModal(true)}
                className="text-[12px] font-medium text-[#2563eb] hover:underline"
              >
                + Manual Log
              </button>
            </div>

            {/* Stopwatch widget */}
            <div className="p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] flex items-center justify-between">
              <div className="font-mono text-2xl font-bold text-[#0a0a0a]">
                {formatTimer(timerSeconds)}
              </div>

              <div className="flex items-center gap-2">
                {!timerRunning ? (
                  <button
                    onClick={() => setTimerRunning(true)}
                    className="px-3 py-1.5 bg-[#0a0a0a] text-white text-[12px] font-medium rounded-[6px] flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setLogMinutes(Math.max(1, Math.round(timerSeconds / 60)));
                      setShowLogModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-[12px] font-medium rounded-[6px] flex items-center gap-1"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop & Log</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recorded Worklogs */}
            {workLogs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono uppercase text-[#737373]">Logged Effort</div>
                {workLogs.slice(0, 3).map((w) => (
                  <div
                    key={w._id}
                    className="p-2 bg-white border border-[#e5e5e5] rounded-[6px] text-[12px] flex items-center justify-between"
                  >
                    <span className="truncate max-w-[170px] text-[#525252]">{w.description}</span>
                    <span className="font-mono font-semibold text-[#0a0a0a]">{w.durationMinutes} min</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Asset Context Details */}
          {ticket.asset ? (
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="text-[12px] font-mono uppercase text-[#737373] flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Affected Hardware Device</span>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="font-medium text-[#0a0a0a]">{ticket.asset.name}</div>
                <div className="text-[12px] font-mono text-[#737373]">Tag: {ticket.asset.assetTag}</div>
                <div className="text-[12px] font-mono text-[#737373]">Serial: {ticket.asset.serialNumber}</div>
                <div className="text-[12px] text-[#525252]">Model: {ticket.asset.model}</div>
              </div>
            </div>
          ) : null}

          {/* Requester Profile */}
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-mono uppercase text-[#737373] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Requester Information</span>
            </div>
            <div className="space-y-1 text-[13px]">
              <div className="font-medium text-[#0a0a0a]">{ticket.requester?.name}</div>
              <div className="text-[12px] text-[#737373]">{ticket.requester?.email}</div>
              <div className="text-[12px] text-[#737373]">
                Department: {ticket.requester?.department?.name || 'Enterprise'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Work Log Modal ─────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">Log Work Time</h3>
            <form onSubmit={handleLogWork} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#fafafa] border rounded-[8px] text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1">
                  Work Performed
                </label>
                <textarea
                  rows="3"
                  required
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  placeholder="Ran diagnostics, reset network adapter, tested connectivity..."
                  className="w-full p-3 bg-[#fafafa] border rounded-[8px] text-[13px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-[13px] border rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-5 py-2 bg-[#0a0a0a] text-white text-[13px] font-medium rounded-[8px]"
                >
                  {submittingLog ? 'Saving...' : 'Save Work Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Structured Resolution Modal ────────────────────────────── */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Confirm Ticket Resolution</span>
            </div>
            <p className="text-[13px] text-[#737373]">
              Provide a clear summary of how this issue was resolved. The employee will receive a notification with this summary to confirm or reopen.
            </p>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1">
                  Resolution Summary & Root Cause <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Root cause: DHCP lease expiration on subnet. Fixed by renewing IP configuration and flushing local DNS cache."
                  className="w-full p-3.5 bg-[#fafafa] border rounded-[8px] text-[13px] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 text-[13px] border rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution || !resolutionSummary.trim()}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-medium rounded-[8px] shadow-sm"
                >
                  {submittingResolution ? 'Resolving...' : 'Submit Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
