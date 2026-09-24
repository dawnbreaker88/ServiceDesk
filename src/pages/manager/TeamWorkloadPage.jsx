import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Users, Layers, Clock, CheckCircle2, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TeamWorkloadPage({ onSelectTicket }) {
  const { toast } = useToast();
  const [techReport, setTechReport] = useState([]);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reassignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetTicket, setTargetTicket] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [techRes, ticketRes] = await Promise.all([
        apiRequest('/reports/technicians'),
        apiRequest('/tickets?status=OPEN'),
      ]);

      if (techRes.success) setTechReport(techRes.data || []);
      if (ticketRes.success) {
        setUnassignedTickets((ticketRes.data || []).filter((t) => !t.assignee));
      }
    } catch (err) {
      console.error('Failed to load team workload:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignTicket = async (e) => {
    e.preventDefault();
    if (!targetTicket || !selectedTechId) return;

    setAssigning(true);
    try {
      const res = await apiRequest(`/tickets/${targetTicket._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: selectedTechId }),
      });

      if (res.success) {
        toast.success(`Ticket ${targetTicket.ticketNumber} assigned successfully!`);
        setShowAssignModal(false);
        setTargetTicket(null);
        setSelectedTechId('');
        await loadData();
      }
    } catch (err) {
      toast.error('Failed to assign ticket: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Team Capacity & Dispatch</h1>
          <p className="text-[13px] text-[#737373]">
            Balance ticket workloads, monitor technician hours, and dispatch unassigned requests
          </p>
        </div>

        <div className="bg-white border border-[#e5e5e5] px-4 py-2 rounded-[10px] flex items-center gap-3">
          <Users className="w-5 h-5 text-[#2563eb]" />
          <div>
            <div className="text-[11px] font-mono text-[#737373] uppercase">Active Technicians</div>
            <div className="font-mono text-lg font-bold text-[#0a0a0a]">{techReport.length} Staff</div>
          </div>
        </div>
      </div>

      {/* ─── Technician Workload Cards ───────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {techReport.map((t) => (
          <div
            key={t.technician._id}
            className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-semibold text-sm">
                {t.technician.name[0]}
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] text-[#0a0a0a] truncate">
                  {t.technician.name}
                </div>
                <div className="text-[11px] font-mono text-[#737373] truncate">
                  {t.technician.department?.name || 'IT Support Team'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f5f5f5] text-center">
              <div className="p-2 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5]">
                <div className="font-mono font-bold text-lg text-[#0a0a0a]">
                  {t.workload.activeTotal}
                </div>
                <div className="text-[10px] font-mono uppercase text-[#737373]">Active</div>
              </div>

              <div className="p-2 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5]">
                <div className="font-mono font-bold text-lg text-[#2563eb]">
                  {t.workload.totalHoursLogged}h
                </div>
                <div className="text-[10px] font-mono uppercase text-[#737373]">Logged</div>
              </div>

              <div className="p-2 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5]">
                <div className="font-mono font-bold text-lg text-emerald-700">
                  {t.workload.resolved}
                </div>
                <div className="text-[10px] font-mono uppercase text-[#737373]">Resolved</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Unassigned Queue Dispatcher ─────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div>
            <h2 className="font-display font-semibold text-base text-[#0a0a0a]">
              Unassigned Dispatch Queue
            </h2>
            <p className="text-[12px] text-[#737373]">
              Assign incoming requests to specific technicians based on capacity
            </p>
          </div>
          <span className="bg-[#0a0a0a] text-white text-[11px] font-mono px-2.5 py-1 rounded-full">
            {unassignedTickets.length} Unassigned
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[13px] text-[#737373]">Loading dispatch queue...</div>
        ) : unassignedTickets.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Dispatch Queue Clear</h3>
            <p className="text-[13px] text-[#737373]">
              All open tickets are currently assigned to active technicians.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#ffffff] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {unassignedTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0a0a0a]">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a] max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.requester?.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.category?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {t.priority}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setTargetTicket(t);
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[12px] font-medium rounded-[6px] transition-all inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign Tech</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Dispatch Modal ─────────────────────────────────────────── */}
      {showAssignModal && targetTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
              Dispatch {targetTicket.ticketNumber}
            </h3>
            <p className="text-[13px] text-[#737373]">
              Subject: "{targetTicket.title}"
            </p>

            <form onSubmit={handleAssignTicket} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Select Technician
                </label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px]"
                >
                  <option value="">-- Choose Technician --</option>
                  {techReport.map((t) => (
                    <option key={t.technician._id} value={t.technician._id}>
                      {t.technician.name} ({t.workload.activeTotal} active tickets)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-[13px] border rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedTechId}
                  className="px-6 py-2 bg-[#0a0a0a] text-white text-[13px] font-medium rounded-[8px]"
                >
                  {assigning ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
