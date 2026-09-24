import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Clock,
  Edit2,
  Plus,
  Flame,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSla() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    escalationHours: 2,
    businessHoursOnly: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/sla');
      if (res.success) {
        setPolicies(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load SLA policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleOpenEdit = (policy) => {
    setSelectedPolicy(policy);
    setEditForm({
      name: policy.name || '',
      responseTimeHours: policy.responseTimeHours || 1,
      resolutionTimeHours: policy.resolutionTimeHours || 4,
      escalationHours: policy.escalationHours || 2,
      businessHoursOnly: policy.businessHoursOnly !== false,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/sla/${selectedPolicy._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editForm,
          responseTimeHours: Number(editForm.responseTimeHours),
          resolutionTimeHours: Number(editForm.resolutionTimeHours),
          escalationHours: Number(editForm.escalationHours),
        }),
      });

      if (res.success) {
        toast.success(`SLA Policy for ${selectedPolicy.priority} updated.`);
        setShowEditModal(false);
        setSelectedPolicy(null);
        await loadPolicies();
      }
    } catch (err) {
      toast.error('Failed to update SLA policy: ' + err.message);
    } finally {
      setUpdating(false);
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

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">SLA Policy Matrix</h1>
          <p className="text-[13px] text-[#737373]">
            Define response & resolution deadlines, breach warnings, and business hours escalation rules
          </p>
        </div>
      </div>

      {/* ─── Policies Grid ──────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-16 text-center text-[13px] text-[#737373]">
            Loading SLA policy matrix...
          </div>
        ) : policies.length === 0 ? (
          <div className="col-span-full p-16 text-center">
            <ShieldCheck className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No SLA policies configured</h3>
            <p className="text-[13px] text-[#737373]">Run seed or create your first SLA policy.</p>
          </div>
        ) : (
          policies.map((pol) => (
            <div
              key={pol._id}
              className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#0a0a0a] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${getPriorityBadge(pol.priority)}`}>
                    {pol.priority}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(pol)}
                    className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded hover:bg-[#fafafa]"
                    title="Edit SLA Policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-[15px] text-[#0a0a0a]">
                    {pol.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#737373] mt-0.5">
                    {pol.businessHoursOnly ? '8x5 Business Hours' : '24x7 Continuous SLA'}
                  </div>
                </div>

                <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Response Target:</span>
                    <span className="font-mono font-bold text-[#0a0a0a]">
                      {pol.responseTimeHours} {pol.responseTimeHours === 1 ? 'Hour' : 'Hours'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Resolution Target:</span>
                    <span className="font-mono font-bold text-[#0a0a0a]">
                      {pol.resolutionTimeHours} {pol.resolutionTimeHours === 1 ? 'Hour' : 'Hours'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f5f5f5] text-[11px] font-mono text-[#737373]">
                Breach Warning at: <strong className="text-[#0a0a0a]">&lt; 1 hour remaining</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Edit SLA Policy Modal ───────────────────────────────────── */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Edit SLA: {selectedPolicy.priority}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Response Target (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    required
                    value={editForm.responseTimeHours}
                    onChange={(e) => setEditForm({ ...editForm, responseTimeHours: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Resolution Target (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={editForm.resolutionTimeHours}
                    onChange={(e) => setEditForm({ ...editForm, resolutionTimeHours: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Operating Hours Model
                </label>
                <select
                  value={editForm.businessHoursOnly ? 'true' : 'false'}
                  onChange={(e) => setEditForm({ ...editForm, businessHoursOnly: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                >
                  <option value="true">Business Hours Only (8am - 6pm Mon-Fri)</option>
                  <option value="false">24x7 Continuous Calendar SLA</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-[8px] text-[#525252]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-[#0a0a0a] text-white font-medium rounded-[8px]"
                >
                  {updating ? 'Saving...' : 'Update SLA Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
