import React, { useState, useEffect } from 'react';
import { createTicket } from '../../api/ticketApi';
import { getCategories } from '../../api/guideApi';
import { getMyAssets } from '../../api/assetApi';
import {
  X,
  Paperclip,
  Trash2,
  AlertCircle,
  Clock,
  Laptop,
  CheckCircle2,
  FileText,
  Upload,
} from 'lucide-react';

export default function CreateManualTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assetId, setAssetId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userAssets, setUserAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setFetchingData(true);
      try {
        const [catRes, assetRes] = await Promise.all([getCategories(), getMyAssets()]);
        if (catRes.success && catRes.data.length > 0) {
          setCategories(catRes.data);
          setCategoryId(catRes.data[0]._id);
        }
        if (assetRes.success) {
          setUserAssets(assetRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load modal metadata:', err);
      } finally {
        setFetchingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle local file selection and convert to mock/data URI attachment object
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
            url: reader.result, // Data URL for preview & storage
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      alert('Please fill out the title, description, and select a category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: categoryId,
        priority,
        asset: assetId || null,
        attachments,
        source: 'MANUAL',
      };

      const res = await createTicket(payload);
      if (res.success && res.data) {
        // Reset form
        setTitle('');
        setDescription('');
        setAttachments([]);
        setPriority('MEDIUM');
        setAssetId('');
        onTicketCreated(res.data._id);
        onClose();
      }
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] max-w-[680px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] text-white flex items-center justify-center text-xs font-mono">
              SD
            </div>
            <div>
              <h2 className="font-display font-semibold text-[15px] text-[#0a0a0a] leading-tight">
                Create Support Ticket
              </h2>
              <p className="text-[12px] text-[#737373]">Submit a direct request to the IT technician queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] hover:bg-[#eaeaea] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
              Ticket Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary (e.g., VPN connection fails with Error 800)"
              className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:bg-white"
              >
                <option value="LOW">Low (Non-urgent / Routine)</option>
                <option value="MEDIUM">Medium (Standard Request)</option>
                <option value="HIGH">High (Impacting Productivity)</option>
                <option value="CRITICAL">Critical (Total Work Blocker)</option>
              </select>
            </div>
          </div>

          {/* Affected Hardware Asset */}
          <div>
            <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
              Assigned Hardware Device (Optional)
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] focus:bg-white"
            >
              <option value="">None / Not Device Specific</option>
              {userAssets.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.assetTag}) - {a.model}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem, error messages, and what you were doing when it occurred..."
              className="w-full p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:bg-white transition-all"
            />
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-mono uppercase text-[#737373]">
                Attachments & Screenshots
              </label>
              <label className="cursor-pointer text-[12px] font-medium text-[#2563eb] hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.log,.csv"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-[#ffffff] border border-[#e5e5e5] rounded-[6px] text-[12px]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-[#737373] flex-shrink-0" />
                      <span className="font-medium text-[#0a0a0a] truncate">{file.name}</span>
                      <span className="font-mono text-[10px] text-[#737373]">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-[#737373] hover:text-red-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#525252] hover:text-[#0a0a0a] border border-[#e5e5e5] rounded-[8px] hover:bg-[#fafafa] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all disabled:opacity-40 shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
