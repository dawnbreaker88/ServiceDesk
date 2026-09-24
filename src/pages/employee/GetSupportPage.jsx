import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sendAiChat, escalateToTicket } from '../../api/aiApi';
import { getMyAssets } from '../../api/assetApi';
import { getCategories } from '../../api/guideApi';
import CreateManualTicketModal from '../../components/tickets/CreateManualTicketModal';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Send,
  RotateCcw,
  PlusCircle,
  Paperclip,
  Trash2,
  FileText,
  Upload,
  Bot,
  User,
  Shield,
} from 'lucide-react';

export default function GetSupportPage({ initialQuery = '', onTicketCreated }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(initialQuery);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Escalation flow state
  const [showEscalation, setShowEscalation] = useState(false);
  const [userAssets, setUserAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');
  const [attachments, setAttachments] = useState([]);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const messagesEndRef = useRef(null);
  const initialSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If initialQuery passed from Home, send automatically once
  useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Load assets and categories for escalation
  useEffect(() => {
    const loadContext = async () => {
      try {
        const [assetRes, catRes] = await Promise.all([getMyAssets(), getCategories()]);
        if (assetRes.success) setUserAssets(assetRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load support context:', err);
      }
    };
    loadContext();
  }, []);

  const handleSendMessage = async (textToSend, action = null) => {
    const text = textToSend !== undefined && textToSend !== null ? textToSend : inputText;
    if (!text && !action) return;

    // Determine user bubble content without emojis
    let userBubbleText = text;
    if (action === 'SOLVED') userBubbleText = 'Issue is resolved';
    else if (action === 'NEXT_STEP') userBubbleText = 'Requesting next troubleshooting step';
    else if (action === 'ESCALATE_TICKET') userBubbleText = 'Please escalate to an official IT ticket';

    if (userBubbleText) {
      setMessages((prev) => [...prev, { role: 'user', content: userBubbleText }]);
      setInputText('');
    }

    setLoading(true);

    try {
      const payload = {
        sessionId,
        message: text || userBubbleText,
        action,
      };

      const res = await sendAiChat(payload);
      if (res.success) {
        if (!sessionId) setSessionId(res.sessionId);

        if (res.response) {
          setMessages((prev) => {
            // Avoid duplicate assistant message if identical to last
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.content === res.response.content) {
              return prev;
            }
            return [...prev, res.response];
          });
        }

        if (res.status === 'RESOLVED') {
          setResolved(true);
          toast.success('Issue marked as resolved.');
        }

        if (res.status === 'ESCALATED' || res.canCreateTicket) {
          setShowEscalation(true);
          setTicketTitle(res.suggestedTitle || text || 'IT Support Assistance Request');
          setTicketDescription(
            res.suggestedDescription || text || initialQuery || 'Issue requiring IT staff investigation.'
          );
          if (res.suggestedPriority) setTicketPriority(res.suggestedPriority);
          if (res.suggestedCategory?._id) {
            setSelectedCategoryId(res.suggestedCategory._id);
          } else if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0]._id);
          }
          if (userAssets.length > 0 && !selectedAssetId) {
            setSelectedAssetId(userAssets[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Support triage error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach the automated triage engine. Would you like to create an IT ticket directly?',
        },
      ]);
      setShowEscalation(true);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmTicketCreation = async (e) => {
    e.preventDefault();
    setSubmittingTicket(true);

    try {
      const payload = {
        sessionId,
        title: ticketTitle,
        description: ticketDescription,
        categoryId: selectedCategoryId || categories[0]?._id,
        priority: ticketPriority,
        assetId: selectedAssetId || null,
        attachments,
      };

      const res = await escalateToTicket(payload);
      if (res.success && res.data) {
        toast.success(`Ticket #${res.data.ticketNumber || ''} created successfully!`);
        onTicketCreated(res.data._id);
      }
    } catch (err) {
      toast.error('Failed to submit ticket: ' + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(null);
    setInputText('');
    setResolved(false);
    setShowEscalation(false);
    setAttachments([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[640px] space-y-4">
      {/* ─── Header & Manual Option ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">AI Support Diagnostic Console</h1>
          <p className="text-[13px] text-[#737373]">
            Interactive automated IT triage, real-time troubleshooting, and direct ticket escalation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="text-[12px] text-[#737373] hover:text-[#0a0a0a] flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          )}

          <button
            onClick={() => setShowManualModal(true)}
            className="text-[12px] font-medium text-[#0a0a0a] bg-[#f5f5f5] hover:bg-[#eaeaea] flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border border-[#e5e5e5] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Create Ticket Manually</span>
          </button>
        </div>
      </div>

      {/* ─── Full Console Chat Workspace ─────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col flex-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-0">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="font-display font-semibold text-lg text-[#0a0a0a] mb-1">
                How can we help you today?
              </h2>
              <p className="text-[14px] text-[#737373] mb-6 leading-relaxed">
                Describe the issue you are experiencing. The diagnostic system will guide you through step-by-step resolution or prepare a ticket for technician review.
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Wi-Fi network connection drops',
                  'Cannot connect to corporate VPN',
                  'Outlook email sync failing',
                  'Password reset or account locked',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="px-3.5 py-1.5 bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[9999px] text-[12px] text-[#525252] hover:text-[#0a0a0a] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] text-white flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                      SD
                    </div>
                  )}

                  <div
                    className={`p-4 sm:p-5 rounded-[12px] text-[14px] leading-relaxed max-w-[88%] ${
                      m.role === 'user'
                        ? 'bg-[#0a0a0a] text-white rounded-tr-none'
                        : 'bg-[#fafafa] border border-[#e5e5e5] text-[#171717] rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-line">{m.content}</div>
                    ) : (
                      <div className="space-y-3 prose-sm max-w-none text-[#171717]">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[#171717]">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-[#0a0a0a]">{children}</strong>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 my-2">{children}</ol>,
                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 bg-[#f0f0f0] border border-[#e5e5e5] rounded text-[13px] font-mono text-[#0a0a0a]">
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
                          {m.content}
                        </ReactMarkdown>

                        {/* Inline Assistant Action Helpers */}
                        {!resolved && idx === messages.length - 1 && !loading && (
                          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#e5e5e5]">
                            <button
                              type="button"
                              onClick={() => handleSendMessage(null, 'SOLVED')}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-[6px] text-[12px] font-medium transition-colors"
                            >
                              Issue is Solved
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendMessage(null, 'NEXT_STEP')}
                              className="px-3 py-1 bg-white hover:bg-[#f0f0f0] text-[#525252] border border-[#e5e5e5] rounded-[6px] text-[12px] font-medium transition-colors"
                            >
                              Next Step
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendMessage(null, 'ESCALATE_TICKET')}
                              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-[6px] text-[12px] font-medium transition-colors"
                            >
                              Escalate to IT Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex-shrink-0 flex items-center justify-center text-xs font-semibold text-[#525252]">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-[13px] text-[#737373]">
                  <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] text-white flex items-center justify-center text-xs">SD</div>
                  <div className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] rounded-tl-none animate-pulse">
                    Analyzing issue diagnostics...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Bottom Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 bg-[#ffffff] border-t border-[#e5e5e5] flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="text"
            disabled={loading || resolved}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              resolved
                ? 'Issue resolved. Click "Reset Chat" to start a new inquiry.'
                : 'Type your message or diagnostic details...'
            }
            className="flex-1 px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim() || resolved}
            className="px-4 py-2.5 bg-[#0a0a0a] hover:bg-[#262626] text-white rounded-[8px] transition-all disabled:opacity-40 flex items-center gap-1.5 text-[13px] font-medium"
            title="Send Message"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ─── Escalation to Official Ticket Box ──────────────────────── */}
      {showEscalation && (
        <div className="bg-[#ffffff] border-2 border-[#0a0a0a] rounded-[16px] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a]">
              <AlertCircle className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Submit Official Support Ticket
              </h3>
              <p className="text-[13px] text-[#737373]">
                Review and refine your ticket details before submitting to IT staff.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmTicketCreation} className="space-y-4 pt-2">
            <div>
              <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                Ticket Title
              </label>
              <input
                type="text"
                required
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                Description / Problem Summary
              </label>
              <textarea
                rows={3}
                required
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Describe what is wrong and what assistance is needed..."
                className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a] resize-y"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Affected Hardware Device
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
                >
                  <option value="">None / General Inquiry</option>
                  {userAssets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.assetTag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Priority
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Attachments for Escalation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-mono uppercase text-[#737373]">
                  Optional Attachments
                </label>
                <label className="cursor-pointer text-[12px] font-medium text-[#2563eb] hover:underline flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Screenshot or Log</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.log"
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1 p-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 bg-[#ffffff] border border-[#e5e5e5] rounded-[6px] text-[12px]"
                    >
                      <span className="font-medium text-[#0a0a0a] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-[#737373] hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEscalation(false)}
                className="px-4 py-2 text-[13px] font-medium text-[#525252] hover:text-[#0a0a0a] border border-[#e5e5e5] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingTicket}
                className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-2"
              >
                <span>{submittingTicket ? 'Submitting...' : 'Create Ticket'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Ticket Modal */}
      <CreateManualTicketModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onTicketCreated={(newTicketId) => {
          onTicketCreated(newTicketId);
        }}
      />
    </div>
  );
}
