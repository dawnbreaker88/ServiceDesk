import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import {
  Laptop,
  Search,
  Plus,
  Filter,
  UserCheck,
  Wrench,
  Archive,
  ArrowRight,
  X,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react';

export default function ManagerAssets({ onSelectTicket }) {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals & drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // New Asset form state
  const [newAsset, setNewAsset] = useState({
    name: '',
    assetTag: '',
    category: 'HARDWARE',
    type: 'LAPTOP',
    model: '',
    serialNumber: '',
    cost: '',
    purchaseDate: '',
    warrantyExpiry: '',
    specs: '',
  });
  const [creating, setCreating] = useState(false);

  const loadAssetsAndUsers = async () => {
    setLoading(true);
    try {
      const [assetRes, userRes] = await Promise.all([
        apiRequest('/assets'),
        apiRequest('/users'),
      ]);
      if (assetRes.success) setAssets(assetRes.data || []);
      if (userRes.success) setUsers(userRes.data || []);
    } catch (err) {
      console.error('Failed to load asset inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetsAndUsers();
  }, []);

  // Filter assets
  const filteredAssets = assets.filter((a) => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.assetTag.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.assignedUser?.name?.toLowerCase().includes(q)
    );
  });

  // Handle Create Asset
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.assetTag || !newAsset.serialNumber) {
      alert('Name, asset tag, and serial number are required.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...newAsset,
        cost: Number(newAsset.cost) || 0,
        purchaseDate: newAsset.purchaseDate || new Date(),
        warrantyExpiry: newAsset.warrantyExpiry || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
      };

      const res = await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewAsset({
          name: '',
          assetTag: '',
          category: 'HARDWARE',
          type: 'LAPTOP',
          model: '',
          serialNumber: '',
          cost: '',
          purchaseDate: '',
          warrantyExpiry: '',
          specs: '',
        });
        await loadAssetsAndUsers();
      }
    } catch (err) {
      alert('Failed to register asset: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Handle Assign Device
  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !selectedUserId) return;

    setAssigning(true);
    try {
      const res = await apiRequest(`/assets/${selectedAsset._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.success) {
        setShowAssignModal(false);
        setSelectedAsset(null);
        setSelectedUserId('');
        await loadAssetsAndUsers();
      }
    } catch (err) {
      alert('Failed to assign asset: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Handle Unassign / Return to Stock
  const handleUnassignAsset = async (assetId) => {
    if (!confirm('Return this asset to available inventory storage?')) return;
    try {
      const res = await apiRequest(`/assets/${assetId}/unassign`, { method: 'POST' });
      if (res.success) {
        await loadAssetsAndUsers();
      }
    } catch (err) {
      alert('Failed to unassign asset: ' + err.message);
    }
  };

  // Handle Status Update (e.g. IN_REPAIR)
  const handleStatusChange = async (assetId, newStatus) => {
    try {
      const res = await apiRequest(`/assets/${assetId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        await loadAssetsAndUsers();
      }
    } catch (err) {
      alert('Failed to update asset status: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_STOCK':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_REPAIR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RETIRED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Action Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Hardware & Asset Lifecycle</h1>
          <p className="text-[13px] text-[#737373]">
            Track inventory, procurement, user assignment, warranties, and maintenance
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* ─── Filter & Search Bar ─────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-3.5 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          {/* Status Filter Tabs */}
          {['ALL', 'ASSIGNED', 'IN_STOCK', 'IN_REPAIR', 'RETIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                filterStatus === st
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Type Selector */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[12px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
          >
            <option value="ALL">All Hardware Types</option>
            <option value="LAPTOP">Laptops</option>
            <option value="DESKTOP">Desktops & Workstations</option>
            <option value="MONITOR">Monitors</option>
            <option value="PHONE">Mobile & Tablets</option>
            <option value="SERVER">Infrastructure / Servers</option>
            <option value="OTHER">Peripherals & Accessories</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tag, serial, user..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
            />
          </div>
        </div>
      </div>

      {/* ─── Assets Inventory Table ─────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[13px] text-[#737373]">Loading inventory fleet...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-16 text-center">
            <Laptop className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No assets found</h3>
            <p className="text-[13px] text-[#737373]">Try resetting your filter or adding a new asset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Asset Name & Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4">Serial #</th>
                  <th className="py-3 px-4">Warranty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {filteredAssets.map((a) => (
                  <tr key={a._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0a0a0a] whitespace-nowrap">
                      {a.assetTag}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a]">
                      <div>{a.name}</div>
                      <div className="text-[11px] font-mono text-[#737373]">{a.model}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-mono font-medium border ${getStatusBadge(a.status)}`}>
                        ● {a.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {a.assignedUser ? (
                        <div>
                          <span className="font-medium text-[#0a0a0a] block">{a.assignedUser.name}</span>
                          <span className="text-[11px] text-[#737373]">{a.assignedUser.email}</span>
                        </div>
                      ) : (
                        <span className="text-[#737373] italic">Available in Storage</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#525252] whitespace-nowrap">
                      {a.serialNumber}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737373] whitespace-nowrap">
                      {a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!a.assignedUser ? (
                          <button
                            onClick={() => {
                              setSelectedAsset(a);
                              setShowAssignModal(true);
                            }}
                            className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[11px] font-medium rounded-[6px] transition-all"
                          >
                            Assign User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnassignAsset(a._id)}
                            className="px-2.5 py-1 bg-white hover:bg-[#f5f5f5] text-[#525252] hover:text-[#0a0a0a] text-[11px] font-medium border border-[#e5e5e5] rounded-[6px] transition-all"
                          >
                            Unassign
                          </button>
                        )}

                        {a.status !== 'IN_REPAIR' && (
                          <button
                            onClick={() => handleStatusChange(a._id, 'IN_REPAIR')}
                            title="Send for Repair"
                            className="p-1 text-[#737373] hover:text-amber-600 rounded"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create Asset Modal ─────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-[#2563eb]" />
                <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">Register New Hardware Asset</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737373] hover:text-[#0a0a0a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-[13px]">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    placeholder="e.g. MacBook Pro 16 M3 Max"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Asset Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.assetTag}
                    onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                    placeholder="e.g. AST-0089"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Hardware Type
                  </label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MONITOR">Monitor</option>
                    <option value="PHONE">Phone / Tablet</option>
                    <option value="SERVER">Server</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newAsset.model}
                    onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                    placeholder="e.g. Apple M3 Max 36GB"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Serial # <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    placeholder="e.g. C02G901XMD6R"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Procurement Cost ($)
                  </label>
                  <input
                    type="number"
                    value={newAsset.cost}
                    onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })}
                    placeholder="3499"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Warranty Expiration
                  </label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiry}
                    onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-[8px] text-[#525252]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white font-medium rounded-[8px]"
                >
                  {creating ? 'Saving...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Assign Asset Modal ─────────────────────────────────────── */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Assign {selectedAsset.name}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5] text-[12px] space-y-1">
              <div><span className="text-[#737373]">Tag:</span> <span className="font-mono font-medium">{selectedAsset.assetTag}</span></div>
              <div><span className="text-[#737373]">Serial:</span> <span className="font-mono">{selectedAsset.serialNumber}</span></div>
            </div>

            <form onSubmit={handleAssignAsset} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Select Employee / Staff Member
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px] text-[#0a0a0a]"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role}) - {u.email}
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
                  disabled={assigning || !selectedUserId}
                  className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px]"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
