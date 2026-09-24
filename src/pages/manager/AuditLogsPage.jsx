import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { ShieldCheck, Search, Filter, Clock, User, FileText, ArrowRight } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await apiRequest('/audit');
        if (res.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.actorName?.toLowerCase().includes(q) ||
      l.entity?.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action) => {
    if (action.includes('CREATED')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('ASSIGNED')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('RESOLVED') || action.includes('CLOSED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REOPENED') || action.includes('DELETED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Immutable Audit Trail</h1>
          <p className="text-[13px] text-[#737373]">
            Tamper-evident log of all ticket operations, asset transfers, and security events
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[#737373] text-[13px]">Loading compliance log stream...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldCheck className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No audit records found</h3>
            <p className="text-[13px] text-[#737373]">No events match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Change Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737373] whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#0a0a0a] whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-3.5 px-4 text-[#0a0a0a] font-medium whitespace-nowrap">
                      {log.actorName || log.actor?.name || 'System Engine'}
                    </td>
                    <td className="py-3.5 px-4 text-[#525252] max-w-md">
                      {log.details}
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
