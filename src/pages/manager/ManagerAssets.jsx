import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
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
  Edit2,
  Info,
  History,
  RotateCcw,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function ManagerAssets({ onSelectTicket }) {
  const { toast, confirm, prompt } = useToast();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals & drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetail, setAssetDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignReason, setAssignReason] = useState('Hardware allocation');
  const [assigning, setAssigning] = useState(false);

  // Form states
  const [newAsset, setNewAsset] = useState({
    name: '',
    assetTag: '',
    category: 'HARDWARE',
    type: 'LAPTOP',
    model: '',
    serialNumber: '',
    vendor: '',
    cost: '',
    purchaseDate: '',
    warrantyExpiry: '',
    notes: '',
    specs: '',
  });
  const [creating, setCreating] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    vendor: '',
    cost: '',
    purchaseDate: '',
    warrantyExpiry: '',
    notes: '',
  });
  const [updating, setUpdating] = useState(false);

  const loadAssetsAndUsers = async () => {
    setLoading(true);
    try {
      const [assetRes, userRes] = await Promise.all([
        apiRequest('/assets?limit=100'),
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
    if (filterType !== 'ALL' && a.category !== filterType && a.type !== filterType) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.serialNumber?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q) ||
      a.assignedUser?.name?.toLowerCase().includes(q)
    );
  });

  // Open asset detail drawer
  const handleOpenDetail = async (asset) => {
    setSelectedAsset(asset);
    setShowDetailDrawer(true);
    setLoadingDetail(true);
    try {
      const res = await apiRequest(`/assets/${asset._id}`);
      if (res.success) {
        setAssetDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load asset detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit modal
  const handleOpenEdit = (asset, e) => {
    if (e) e.stopPropagation();
    setSelectedAsset(asset);
    setEditFormData({
      name: asset.name || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      vendor: asset.vendor || '',
      cost: asset.cost || '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
      notes: asset.notes || '',
    });
    setShowEditModal(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/assets/${selectedAsset._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editFormData,
          cost: Number(editFormData.cost) || 0,
        }),
      });

      if (res.success) {
        toast.success(`Asset ${selectedAsset.assetTag} updated successfully!`);
        setShowEditModal(false);
        setSelectedAsset(null);
        await loadAssetsAndUsers();
      }
    } catch (err) {
      toast.error('Failed to update asset: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle Create Asset
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.assetTag || !newAsset.serialNumber) {
      toast.warning('Name, asset tag, and serial number are required.');
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
        toast.success(`Asset ${newAsset.assetTag} registered successfully!`);
        setShowCreateModal(false);
        setNewAsset({
          name: '',
          assetTag: '',
          category: 'HARDWARE',
          type: 'LAPTOP',
          model: '',
          serialNumber: '',
          vendor: '',
          cost: '',
          purchaseDate: '',
          warrantyExpiry: '',
          notes: '',
          specs: '',
        });
        await loadAssetsAndUsers();
      }
    } catch (err) {
      toast.error('Failed to register asset: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Handle Assign / Transfer Device
  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !selectedUserId) return;

    setAssigning(true);
    try {
      const res = await apiRequest(`/assets/${selectedAsset._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ userId: selectedUserId, reason: assignReason }),
      });

      if (res.success) {
        toast.success(`Asset ${selectedAsset.assetTag} allocated successfully!`);
        setShowAssignModal(false);
        setSelectedAsset(null);
        setSelectedUserId('');
        setAssignReason('Hardware allocation');
        await loadAssetsAndUsers();
        if (showDetailDrawer) {
          handleOpenDetail(selectedAsset);
        }
      }
    } catch (err) {
      toast.error('Failed to assign asset: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Handle Return to Stock
  const handleReturnAsset = async (assetId, e) => {
    if (e) e.stopPropagation();
    const ok = await confirm({
      title: 'Return Device to Storage?',
      message: 'This will unassign the current user and return the device to company stock.',
      confirmText: 'Return to Stock',
    });
    if (!ok) return;

    try {
      const res = await apiRequest(`/assets/${assetId}/return`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Asset returned to company stock by manager' }),
      });
      if (res.success) {
        toast.success('Asset returned to stock successfully.');
        await loadAssetsAndUsers();
        if (showDetailDrawer && selectedAsset?._id === assetId) {
          handleOpenDetail(selectedAsset);
        }
      }
    } catch (err) {
      toast.error('Failed to return asset: ' + err.message);
    }
  };

  // Handle Send for Repair
  const handleRepairAsset = async (assetId, e) => {
    if (e) e.stopPropagation();
    const reason = await prompt({
      title: 'Send Asset for Repair',
      message: 'Provide the diagnosed hardware defect or reason for maintenance:',
      placeholder: 'e.g. Battery replacement, fan noise, cracked screen',
      defaultValue: 'Hardware diagnostic / repair',
      confirmText: 'Mark in Repair',
    });
    if (!reason) return;

    try {
      const res = await apiRequest(`/assets/${assetId}/repair`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (res.success) {
        toast.success('Asset marked IN_REPAIR.');
        await loadAssetsAndUsers();
        if (showDetailDrawer && selectedAsset?._id === assetId) {
          handleOpenDetail(selectedAsset);
        }
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  // Handle Retire Asset
  const handleRetireAsset = async (assetId, e) => {
    if (e) e.stopPropagation();
    const ok = await confirm({
      title: 'Decommission & Retire Asset?',
      message: 'This hardware asset will be permanently marked as RETIRED.',
      confirmText: 'Retire Asset',
      isDestructive: true,
    });
    if (!ok) return;

    try {
      const res = await apiRequest(`/assets/${assetId}/retire`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Asset reached end-of-life or decommissioned by IT' }),
      });
      if (res.success) {
        toast.success('Asset retired.');
        await loadAssetsAndUsers();
        if (showDetailDrawer && selectedAsset?._id === assetId) {
          handleOpenDetail(selectedAsset);
        }
      }
    } catch (err) {
      toast.error('Failed to retire asset: ' + err.message);
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
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Hardware & Asset Management</h1>
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
            <option value="ALL">All Categories</option>
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
              placeholder="Search tag, serial, model, user..."
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
                  <th className="py-3 px-4">Asset Tag</th>
                  <th className="py-3 px-4">Device & Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Warranty</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {filteredAssets.map((a) => (
                  <tr
                    key={a._id}
                    onClick={() => handleOpenDetail(a)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0a0a0a] whitespace-nowrap">
                      {a.assetTag}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a]">
                      <div>{a.name}</div>
                      <div className="text-[11px] font-mono text-[#737373]">{a.model || a.vendor || 'Hardware'}</div>
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

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign or Transfer */}
                        <button
                          onClick={() => {
                            setSelectedAsset(a);
                            setSelectedUserId(a.assignedUser?._id || '');
                            setShowAssignModal(true);
                          }}
                          className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[11px] font-medium rounded-[6px] transition-all inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>{a.assignedUser ? 'Transfer' : 'Assign'}</span>
                        </button>

                        {/* Unassign / Return to Stock if currently assigned */}
                        {a.assignedUser && (
                          <button
                            onClick={(e) => handleReturnAsset(a._id, e)}
                            title="Return to Stock"
                            className="px-2.5 py-1 bg-white hover:bg-[#f5f5f5] text-[#525252] hover:text-[#0a0a0a] text-[11px] font-medium border border-[#e5e5e5] rounded-[6px] transition-all"
                          >
                            Return
                          </button>
                        )}

                        {/* Edit specs/details */}
                        <button
                          onClick={(e) => handleOpenEdit(a, e)}
                          title="Edit Details"
                          className="p-1 text-[#737373] hover:text-[#0a0a0a] rounded hover:bg-[#f5f5f5]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Send for repair */}
                        {a.status !== 'IN_REPAIR' && a.status !== 'RETIRED' && (
                          <button
                            onClick={(e) => handleRepairAsset(a._id, e)}
                            title="Send for Repair"
                            className="p-1 text-[#737373] hover:text-amber-600 rounded hover:bg-[#f5f5f5]"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Retire */}
                        {a.status !== 'RETIRED' && (
                          <button
                            onClick={(e) => handleRetireAsset(a._id, e)}
                            title="Retire Asset"
                            className="p-1 text-[#737373] hover:text-red-600 rounded hover:bg-[#f5f5f5]"
                          >
                            <Archive className="w-3.5 h-3.5" />
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

      {/* ─── Asset Detail & Assignment History Drawer ───────────────── */}
      {showDetailDrawer && selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white border-l border-[#e5e5e5] w-full max-w-xl h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-[#2563eb]" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                    {selectedAsset.name}
                  </h3>
                  <div className="text-[12px] font-mono text-[#737373]">
                    {selectedAsset.assetTag} • {selectedAsset.model}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="text-[#737373] hover:text-[#0a0a0a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px]">
                <div className="text-[#737373] font-mono uppercase text-[10px]">Current Status</div>
                <div className="font-semibold text-[#0a0a0a] mt-1">{selectedAsset.status}</div>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px]">
                <div className="text-[#737373] font-mono uppercase text-[10px]">Serial Number</div>
                <div className="font-mono font-medium text-[#0a0a0a] mt-1">{selectedAsset.serialNumber}</div>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px]">
                <div className="text-[#737373] font-mono uppercase text-[10px]">Procurement Cost</div>
                <div className="font-mono font-medium text-[#0a0a0a] mt-1">
                  ${selectedAsset.cost || 0}
                </div>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[10px]">
                <div className="text-[#737373] font-mono uppercase text-[10px]">Warranty Expiry</div>
                <div className="font-mono font-medium text-[#0a0a0a] mt-1">
                  {selectedAsset.warrantyExpiry ? new Date(selectedAsset.warrantyExpiry).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Current Custodian */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[12px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#2563eb] uppercase font-semibold">
                  Active Custodian / Allocation
                </span>
                {selectedAsset.assignedUser && (
                  <button
                    onClick={(e) => handleReturnAsset(selectedAsset._id, e)}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    Return to Stock
                  </button>
                )}
              </div>
              {selectedAsset.assignedUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-xs">
                    {selectedAsset.assignedUser.name?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-[13px] text-[#0a0a0a]">{selectedAsset.assignedUser.name}</div>
                    <div className="text-[11px] text-[#737373]">{selectedAsset.assignedUser.email}</div>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-[#737373] italic">
                  Device is currently in storage (unassigned).
                </div>
              )}
            </div>

            {/* Assignment Timeline History */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0a]">
                <History className="w-4 h-4 text-[#2563eb]" />
                <span>Assignment & Custody History</span>
              </div>

              {loadingDetail ? (
                <div className="text-[12px] text-[#737373]">Loading history timeline...</div>
              ) : !assetDetail?.history || assetDetail.history.length === 0 ? (
                <div className="p-4 text-center border border-dashed rounded-[10px] text-[12px] text-[#737373]">
                  No historical assignments recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {assetDetail.history.map((h, i) => (
                    <div key={h._id || i} className="p-3 border border-[#e5e5e5] rounded-[10px] bg-[#fafafa] text-[12px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0a0a0a]">{h.user?.name || 'User'}</span>
                        <span className="font-mono text-[10px] text-[#737373]">
                          {new Date(h.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[#525252] text-[11px]">
                        Reason: {h.reason || 'Asset allocated'}
                      </div>
                      {h.returnedAt ? (
                        <div className="text-[10px] font-mono text-emerald-700">
                          Returned: {new Date(h.returnedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-blue-700">Currently Active</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                    Model / Specs
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

      {/* ─── Edit Asset Modal ───────────────────────────────────────── */}
      {showEditModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Edit Asset: {selectedAsset.assetTag}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Model</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editFormData.serialNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Cost ($)</label>
                  <input
                    type="number"
                    value={editFormData.cost}
                    onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={editFormData.warrantyExpiry}
                    onChange={(e) => setEditFormData({ ...editFormData, warrantyExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e5e5]">
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
                  {updating ? 'Saving...' : 'Update Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Assign / Transfer Asset Modal ──────────────────────────── */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                {selectedAsset.assignedUser ? 'Transfer Asset' : 'Assign Asset'}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#fafafa] rounded-[8px] border border-[#e5e5e5] text-[12px] space-y-1">
              <div><span className="text-[#737373]">Device:</span> <span className="font-medium">{selectedAsset.name}</span></div>
              <div><span className="text-[#737373]">Tag:</span> <span className="font-mono font-medium">{selectedAsset.assetTag}</span></div>
              {selectedAsset.assignedUser && (
                <div className="text-amber-700">
                  Currently assigned to: <strong>{selectedAsset.assignedUser.name}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleAssignAsset} className="space-y-4">
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Select Recipient Employee / Staff Member
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

              <div>
                <label className="block text-[12px] font-mono uppercase text-[#737373] mb-1.5">
                  Allocation Reason / Notes
                </label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="e.g. Primary engineering laptop"
                  className="w-full px-3.5 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] text-[13px]"
                />
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
                  {assigning ? 'Assigning...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
