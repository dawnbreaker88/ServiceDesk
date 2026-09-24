import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { ShieldCheck, Flame, Clock, AlertTriangle, ArrowRight, Layers, UserCheck } from 'lucide-react';

export default function ManagerSlaPage({ onSelectTicket }) {
  const [slaData, setSlaData] = useState(null);
  const [slaPolicies, setSlaPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlaData = async () => {
      setLoading(true);
      try {
        const [slaRes, policiesRes] = await Promise.all([
          apiRequest('/reports/sla'),
          apiRequest('/sla'),
        ]);
        if (slaRes.success) setSlaData(slaRes);
        if (policiesRes.success) setSlaPolicies(policiesRes.data || []);
      } catch (err) {
        console.error('Failed to load SLA intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSlaData();
  }, []);

  const formatMinutes = (mins) => {
    if (!mins) return '0m';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remain = mins % 60;
    return remain > 0 ? `${hrs}h ${remain}m` : `${hrs}h`;
  };

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">
            SLA Policies & Breach Monitor
          </h1>
          <p className="text-[13px] text-[#737373]">
            Track enterprise compliance, target deadlines, and active breached escalations
          </p>
        </div>

        <div className="bg-white border border-[#e5e5e5] px-4 py-2 rounded-[10px] flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[11px] font-mono text-[#737373] uppercase">Overall Compliance</div>
            <div className="font-mono text-lg font-bold text-[#0a0a0a]">
              {slaData?.complianceRate || 100}%
            </div>
          </div>
        </div>
      </div>

      {/* ─── SLA Policies Definition Matrix ─────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="font-display font-semibold text-lg text-[#0a0a0a]">
            Configured SLA Service Targets
          </h2>
          <p className="text-[13px] text-[#737373]">
            Standard target response and resolution windows by priority
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {slaPolicies.map((p) => (
            <div
              key={p._id}
              className={`p-4 rounded-[12px] border space-y-2 ${
                p.priority === 'CRITICAL'
                  ? 'bg-red-50/50 border-red-200'
                  : p.priority === 'HIGH'
                  ? 'bg-orange-50/50 border-orange-200'
                  : p.priority === 'MEDIUM'
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-gray-50/50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[13px] text-[#0a0a0a]">
                  {p.priority}
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-black/10">
                  {p.warningThresholdPercent}% Warning
                </span>
              </div>
              <div className="text-[12px] text-[#525252] leading-relaxed">{p.description}</div>
              <div className="pt-2 border-t border-black/5 text-[12px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#737373]">First Response:</span>
                  <span className="font-mono font-semibold">{formatMinutes(p.responseTimeMinutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Resolution:</span>
                  <span className="font-mono font-semibold">{formatMinutes(p.resolutionTimeMinutes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Active Breached Tickets Radar ───────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="font-display font-semibold text-base text-[#0a0a0a]">
                Active Breached Ticket Radar
              </h2>
              <p className="text-[12px] text-[#737373]">
                Tickets that have exceeded their SLA response or resolution window
              </p>
            </div>
          </div>
          <span className="bg-red-100 text-red-800 text-[11px] font-mono px-2.5 py-1 rounded-full font-bold">
            {slaData?.breachedTickets?.length || 0} Breaches
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#737373] text-[13px]">Analyzing SLA fleet status...</div>
        ) : !slaData?.breachedTickets || slaData.breachedTickets.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">Zero Breached Tickets</h3>
            <p className="text-[13px] text-[#737373]">
              All open tickets are currently progressing within their SLA deadline targets.
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
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Deadline Passed</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {slaData.breachedTickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => onSelectTicket(t._id)}
                    className="hover:bg-red-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a] max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.requester?.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252]">
                      {t.assignee?.name || <span className="text-red-700 font-semibold">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-red-600">
                      {t.resolutionDeadline ? new Date(t.resolutionDeadline).toLocaleString() : 'Past Due'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ArrowRight className="w-4 h-4 text-red-500 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
