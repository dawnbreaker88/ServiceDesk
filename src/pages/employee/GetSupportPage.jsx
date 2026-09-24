import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export default function GetSupportPage({ initialQuery = '', onTicketCreated }) {
  const { user } = useAuth();
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
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');
  const [attachments, setAttachments] = useState([]);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If initialQuery passed from Home, send automatically
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
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
    const text = textToSend || inputText;
    if (!text && !action) return;

    // Add user message if typed
    if (text && !action) {
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      setInputText('');
    }

    setLoading(true);

    try {
      const payload = {
        sessionId,
        message: text,
        action,
      };

      const res = await sendAiChat(payload);
      if (res.success) {
        if (!sessionId) setSessionId(res.sessionId);

        if (res.response) {
          setMessages((prev) => [...prev, res.response]);
        }

        if (res.status === 'RESOLVED') {
          setResolved(true);
        }

        if (res.status === 'ESCALATED' || res.canCreateTicket) {
          setShowEscalation(true);
          setTicketTitle(res.suggestedTitle || text || 'IT Support Assistance Request');
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
          options: ['Create Support Ticket'],
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
        categoryId: selectedCategoryId || categories[0]?._id,
        priority: ticketPriority,
        assetId: selectedAssetId || null,
        attachments,
      };

      const res = await escalateToTicket(payload);
      if (res.success && res.data) {
        onTicketCreated(res.data._id);
      }
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
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
    <div className="max-w-[860px] mx-auto space-y-6">
      {/* ─── Header & Manual Option ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Get Support</h1>
          <p className="text-[13px] text-[#737373]">
            Chat with AI diagnostic assistant or file a direct ticket
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="text-[12px] text-[#737373] hover:text-[#0a0a0a] flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#e5e5e5] hover:bg-[#ffffff] transition-all"
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

      {/* ─── Conversational Support Card ─────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col h-[560px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="font-display font-semibold text-lg text-[#0a0a0a] mb-1">
                How can we help you today?
              </h2>
              <p className="text-[14px] text-[#737373] max-w-[420px] mb-6 leading-relaxed">
                Describe what’s wrong in your own words. The AI will guide you through diagnostic steps, or file an official ticket whenever you request.
              </p>

              <div className="flex flex-wrap gap-2 justify-center max-w-[500px]">
                {[
                  'Wi-Fi network connection drops',
                  'Cannot connect to corporate VPN',
                  'Outlook email sync failing',
                  'Password reset or account locked',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="px-3 py-1.5 bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[9999px] text-[12px] text-[#525252] transition-all"
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
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="w-7 h-7 rounded-[6px] bg-[#0a0a0a] text-white flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                      SD
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-[12px] text-[14px] leading-relaxed max-w-[85%] ${
                      m.role === 'user'
                        ? 'bg-[#0a0a0a] text-white rounded-tr-none'
                        : 'bg-[#fafafa] border border-[#e5e5e5] text-[#171717] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>

                    {/* Quick Response Options if provided by assistant */}
                    {m.options && m.options.length > 0 && !resolved && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#e5e5e5]/80">
                        {m.options.map((opt) => (
                          <button
                            key={opt}
                            disabled={loading}
                            onClick={() => {
                              if (opt.toLowerCase().includes('solved') || opt.toLowerCase().includes('🎉') || opt.toLowerCase().includes('worked')) {
                                handleSendMessage(null, 'SOLVED');
                              } else if (opt.toLowerCase().includes('ticket') || opt.toLowerCase().includes('escalat') || opt.toLowerCase().includes('file')) {
                                handleSendMessage(null, 'ESCALATE_TICKET');
                              } else if (opt.toLowerCase().includes('next step') || opt.toLowerCase().includes('➡️')) {
                                handleSendMessage(null, 'NEXT_STEP');
                              } else {
                                handleSendMessage(opt);
                              }
                            }}
                            className="px-3 py-1.5 text-[12px] font-medium rounded-[6px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-[#171717] transition-all disabled:opacity-50"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex-shrink-0 flex items-center justify-center text-xs font-semibold text-[#525252]">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-[13px] text-[#737373]">
                  <div className="w-7 h-7 rounded-[6px] bg-[#0a0a0a] text-white flex items-center justify-center text-xs">SD</div>
                  <div className="px-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] rounded-tl-none animate-pulse">
                    AI Assistant analyzing context...
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
          className="p-3.5 bg-[#ffffff] border-t border-[#e5e5e5] flex items-center gap-2"
        >
          <input
            type="text"
            disabled={loading || resolved}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              resolved
                ? 'Issue marked as resolved. Click "Reset Chat" to start a new inquiry.'
                : 'Type your reply, issue details, or say "create ticket"...'
            }
            className="flex-1 px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim() || resolved}
            className="p-2.5 bg-[#0a0a0a] hover:bg-[#262626] text-white rounded-[8px] transition-all disabled:opacity-40"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
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
                Your AI chat history and diagnostics will automatically be attached for the technician.
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
