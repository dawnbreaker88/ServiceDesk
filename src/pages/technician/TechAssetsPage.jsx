import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { Laptop, Search, ShieldCheck, CheckCircle2, AlertCircle, Wrench, ArrowRight } from 'lucide-react';

export default function TechAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const res = await apiRequest('/assets');
        if (res.success) {
          setAssets(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load assets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const filteredAssets = assets.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.assetTag.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.assignedUser?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Hardware & Asset Inventory</h1>
          <p className="text-[13px] text-[#737373]">
            Inspect hardware devices, warranty dates, and user assignments
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tag, serial, or user..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[#737373] text-[13px]">Loading asset database...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-16 text-center">
            <Laptop className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No assets found</h3>
            <p className="text-[13px] text-[#737373]">No devices match your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Asset Tag</th>
                  <th className="py-3 px-4">Device Name & Specs</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Warranty Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {filteredAssets.map((a) => (
                  <tr key={a._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#0a0a0a] whitespace-nowrap">
                      {a.assetTag}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a]">
                      <div>{a.name}</div>
                      <div className="text-[11px] text-[#737373] font-mono">{a.model}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#525252] font-mono text-[12px]">
                      {a.type}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        a.status === 'ASSIGNED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : a.status === 'IN_REPAIR'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#0a0a0a]">
                      {a.assignedUser?.name || <span className="text-[#a3a3a3]">In Storage</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#525252] whitespace-nowrap">
                      {a.serialNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737373] whitespace-nowrap">
                      {a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A'}
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
