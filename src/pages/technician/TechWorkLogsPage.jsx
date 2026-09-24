import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Clock, Layers, Calendar, User, FileText, ArrowRight } from 'lucide-react';

export default function TechWorkLogsPage({ onSelectTicket }) {
  const { user } = useAuth();
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await apiRequest('/reports/worklogs');
        if (res.success) {
          setWorkLogs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load work logs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const totalMinutes = workLogs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Time Tracking & Work Logs</h1>
          <p className="text-[13px] text-[#737373]">
            Track hours spent resolving tickets and diagnostic sessions
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#e5e5e5] px-4 py-2 rounded-[10px] flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#2563eb]" />
          <div className="text-[13px]">
            <span className="text-[#737373]">Total Effort: </span>
            <span className="font-semibold text-[#0a0a0a] font-mono">{totalHours} hrs</span>
            <span className="text-[#737373] text-[11px]"> ({totalMinutes} mins)</span>
          </div>
        </div>
      </div>

      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[#737373] text-[13px]">Loading work log records...</div>
        ) : workLogs.length === 0 ? (
          <div className="p-16 text-center">
            <Clock className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No work logs recorded</h3>
            <p className="text-[13px] text-[#737373]">
              Start the stopwatch timer or manually log effort inside ticket workstations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Work Description</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Logged At</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {workLogs.map((log) => (
                  <tr
                    key={log._id}
                    onClick={() => log.ticket?._id && onSelectTicket(log.ticket._id)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-[#0a0a0a] whitespace-nowrap">
                      {log.ticket?.ticketNumber || 'Ticket'}
                    </td>
                    <td className="py-3.5 px-4 text-[#171717] max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252] whitespace-nowrap">
                      {log.technician?.name || 'Technician'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-[#0a0a0a] bg-[#f5f5f5] px-2 py-0.5 rounded border border-[#e5e5e5]">
                        {log.durationMinutes} min
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#737373] font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}
