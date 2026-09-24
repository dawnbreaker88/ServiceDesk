import React, { useState, useEffect } from 'react';
import { getTicketById, addComment, closeTicket, reopenTicket } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import { apiRequest } from '../../api/client';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Clock,
  User,
  ShieldCheck,
  Tag,
  Paperclip,
  FileText,
  Upload,
  Download,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function TicketDetailPage({ ticketId, onBack }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reopenPrompt, setReopenPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadTicket = async () => {
    try {
      const res = await getTicketById(ticketId);
      if (res.success && res.data) {
        setTicket(res.data);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) loadTicket();
  }, [ticketId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && commentAttachments.length === 0) return;

    setSubmittingComment(true);
    try {
      const res = await addComment(ticketId, {
        message: newComment,
        isInternal: false,
        attachments: commentAttachments,
      });
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
        setCommentAttachments([]);
      }
    } catch (err) {
      alert('Failed to send comment: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Direct Attachment Upload to Ticket
  const handleDirectFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingAttachment(true);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await apiRequest(`/tickets/${ticketId}/attachments`, {
            method: 'POST',
            body: JSON.stringify({
              name: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              url: reader.result,
            }),
          });
          await loadTicket();
        } catch (err) {
          alert(`Failed to attach ${file.name}: ${err.message}`);
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadingAttachment(false);
  };

  // Handle attachments in comment box
  const handleCommentFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCommentAttachments((prev) => [
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

  const handleConfirmResolution = async () => {
    setActionLoading(true);
    try {
      const res = await closeTicket(ticketId);
      if (res.success) {
        await loadTicket();
      }
    } catch (err) {
      alert('Failed to close ticket: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await reopenTicket(ticketId, rejectionReason);
      if (res.success) {
        setReopenPrompt(false);
        setRejectionReason('');
        await loadTicket();
      }
    } catch (err) {
      alert('Failed to reopen ticket: ' + err.message);
    } finally {
      setActionLoading(false);
    }
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[13px] text-[#737373]">
        Loading ticket information...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-red-600 mb-4">Ticket not found or inaccessible.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-[13px] font-medium border border-[#e5e5e5] rounded-[8px]"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Back Nav & Header ────────────────────────────────────────── */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#737373] hover:text-[#0a0a0a] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-semibold bg-[#f5f5f5] px-2.5 py-1 rounded border border-[#e5e5e5]">
              {ticket.ticketNumber}
            </span>
            <h1 className="font-display font-semibold text-2xl text-[#0a0a0a]">{ticket.title}</h1>
          </div>

          <span className={`px-3 py-1 rounded-[9999px] text-[12px] font-medium border self-start sm:self-auto ${getStatusBadgeClass(ticket.status)}`}>
            ● {ticket.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* ─── Visual Lifecycle Timeline ─────────────────────────────────── */}
      <TicketTimeline ticket={ticket} />

      {/* ─── Resolution Prompt Banner (If RESOLVED) ─────────────────── */}
      {ticket.status === 'RESOLVED' && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[14px] mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Technician marked this ticket as Resolved</span>
            </div>
            <p className="text-[13px] text-emerald-700 leading-relaxed">
              Summary: "{ticket.resolutionSummary || 'Issue resolved.'}"
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setReopenPrompt(true)}
              className="px-3.5 py-2 text-[12px] font-medium text-red-700 bg-white border border-red-200 rounded-[8px] hover:bg-red-50"
            >
              Still Broken (Reopen)
            </button>
            <button
              onClick={handleConfirmResolution}
              disabled={actionLoading}
              className="px-4 py-2 text-[12px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-[8px] transition-all shadow-sm"
            >
              {actionLoading ? 'Closing...' : 'Confirm & Close'}
            </button>
          </div>
        </div>
      )}

      {/* Reopen Modal Prompt */}
      {reopenPrompt && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-[12px] space-y-3">
          <div className="text-[13px] font-semibold text-rose-800">
            Why is this issue still unresolved?
          </div>
          <textarea
            rows="2"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain what is still failing so the technician can continue..."
            className="w-full p-3 bg-white border border-rose-300 rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-rose-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setReopenPrompt(false)}
              className="px-3 py-1.5 text-[12px] text-[#525252] border border-[#e5e5e5] rounded-[6px]"
            >
              Cancel
            </button>
            <button
              onClick={handleReopen}
              disabled={actionLoading || !rejectionReason.trim()}
              className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-[12px] font-medium rounded-[6px]"
            >
              Submit Reopen
            </button>
          </div>
        </div>
      )}

      {/* ─── Split Layout: Conversation vs Metadata ─────────────────── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65%): Issue Description & Conversation Timeline */}
        <div className="lg:col-span-8 bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="text-[12px] font-mono uppercase tracking-wider text-[#737373] mb-1.5">
              Issue Description & Background
            </div>
            <p className="text-[14px] text-[#171717] whitespace-pre-line leading-relaxed">
              {ticket.description}
            </p>

            {/* Ticket Level Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#e5e5e5]">
                <div className="text-[11px] font-mono uppercase text-[#737373] mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attached Files ({ticket.attachments.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ticket.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] flex items-center justify-between gap-2 hover:border-[#0a0a0a] transition-all group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#737373] group-hover:text-[#0a0a0a]" />
                        <span className="text-[12px] font-medium text-[#0a0a0a] truncate">{att.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#737373] flex-shrink-0">
                        {formatFileSize(att.size)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
            {comments.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-[#737373]">
                No comments yet. Write a message below to send information or ask questions.
              </div>
            ) : (
              comments.map((c) => {
                const isMe = c.author?._id === user?._id;
                return (
                  <div key={c._id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center font-semibold text-xs text-[#0a0a0a]">
                        {c.author?.name?.[0] || 'T'}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-[12px] text-[13px] leading-relaxed max-w-[80%] ${
                        isMe
                          ? 'bg-[#0a0a0a] text-white rounded-tr-none'
                          : 'bg-[#fafafa] border border-[#e5e5e5] text-[#171717] rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                        <span className="font-semibold">{c.author?.name} ({c.author?.role})</span>
                        <span className="font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="whitespace-pre-line">{c.message}</div>

                      {/* Comment Attachments */}
                      {c.attachments && c.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 space-y-1">
                          {c.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-[11px] flex items-center gap-1.5 underline ${isMe ? 'text-blue-200' : 'text-blue-600'}`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{att.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-semibold text-xs">
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form & Attachment Bar */}
          {ticket.status !== 'CLOSED' && (
            <div className="p-3.5 border-t border-[#e5e5e5] bg-[#ffffff]">
              {commentAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-[#fafafa] rounded-[6px] border border-[#e5e5e5]">
                  {commentAttachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-[11px] bg-white px-2 py-1 rounded border border-[#e5e5e5]">
                      <FileText className="w-3 h-3 text-[#737373]" />
                      <span className="truncate max-w-[140px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setCommentAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendComment} className="flex gap-2">
                <label className="p-2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer rounded hover:bg-[#f5f5f5] transition-colors flex items-center" title="Attach file or screenshot">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    onChange={handleCommentFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </label>

                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Reply to technician..."
                  className="flex-1 px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] focus:outline-none focus:border-[#0a0a0a]"
                />
                <button
                  type="submit"
                  disabled={submittingComment || (!newComment.trim() && commentAttachments.length === 0)}
                  className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column (35%): Compact Metadata & Ticket Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-wider text-[#737373] pb-2 border-b border-[#f5f5f5]">
              Ticket Details
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                <span className="text-[#737373]">Category</span>
                <span className="font-medium text-[#0a0a0a]">{ticket.category?.name || 'General'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                <span className="text-[#737373]">Priority</span>
                <span className="font-semibold text-[#0a0a0a]">{ticket.priority}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                <span className="text-[#737373]">Assigned Tech</span>
                <span className="font-medium text-[#0a0a0a]">
                  {ticket.assignee?.name || <span className="text-[#a3a3a3]">Awaiting Assignment</span>}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                <span className="text-[#737373]">Hardware Asset</span>
                <span className="font-mono text-[12px] text-[#0a0a0a]">
                  {ticket.asset?.assetTag || 'None'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f5f5f5]">
                <span className="text-[#737373]">Submitted</span>
                <span className="font-mono text-[12px] text-[#525252]">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {ticket.asset && (
              <div className="pt-2 p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                <div className="text-[11px] font-mono text-[#737373] uppercase mb-1">Device Details</div>
                <div className="text-[13px] font-medium text-[#0a0a0a]">{ticket.asset.name}</div>
                <div className="text-[11px] font-mono text-[#525252]">Serial: {ticket.asset.serialNumber}</div>
              </div>
            )}

            {/* Quick Upload Attachment Button in Sidebar */}
            <div className="pt-2">
              <label className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] text-[12px] font-medium text-[#0a0a0a] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{uploadingAttachment ? 'Uploading...' : 'Add Attachment to Ticket'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleDirectFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.log,.csv"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
