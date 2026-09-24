import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  UserX,
  Edit2,
  X,
  CheckCircle2,
  Building2,
  Shield,
  Briefcase,
  Mail,
  RefreshCw,
} from 'lucide-react';

export default function AdminUsers() {
  const { toast, confirm } = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'EMPLOYEE',
    department: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'EMPLOYEE',
    department: '',
    status: 'ACTIVE',
  });
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([
        apiRequest('/users'),
        apiRequest('/departments'),
      ]);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false;
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.name?.toLowerCase().includes(q)
    );
  });

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.warning('Name, email, and temporary password are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });

      if (res.success) {
        toast.success(`Account for ${newUser.name} created successfully!`);
        setShowCreateModal(false);
        setNewUser({
          name: '',
          email: '',
          password: 'Password123!',
          role: 'EMPLOYEE',
          department: '',
        });
        await loadData();
      }
    } catch (err) {
      toast.error('Failed to create user: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      role: user.role || 'EMPLOYEE',
      department: user.department?._id || user.department || '',
      status: user.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/users/${selectedUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify(editFormData),
      });

      if (res.success) {
        toast.success(`User ${selectedUser.name} updated successfully.`);
        setShowEditModal(false);
        setSelectedUser(null);
        await loadData();
      }
    } catch (err) {
      toast.error('Failed to update user: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle Quick Toggle Status (Active / Inactive)
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const ok = await confirm({
      title: `${newStatus === 'ACTIVE' ? 'Reactivate' : 'Deactivate'} User Account?`,
      message: `Are you sure you want to change ${user.name}'s status to ${newStatus}?`,
      confirmText: newStatus === 'ACTIVE' ? 'Reactivate' : 'Deactivate',
      isDestructive: newStatus === 'INACTIVE',
    });
    if (!ok) return;

    try {
      const res = await apiRequest(`/users/${user._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        toast.success(`User status updated to ${newStatus}.`);
        await loadData();
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TECHNICIAN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSET_MANAGER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Identity & Access Management</h1>
          <p className="text-[13px] text-[#737373]">
            Manage enterprise user accounts, RBAC permissions, and department allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-[#737373] hover:text-[#0a0a0a] bg-white border border-[#e5e5e5] rounded-[8px] hover:bg-[#fafafa] transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-3.5 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
          {['ALL', 'EMPLOYEE', 'TECHNICIAN', 'MANAGER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                filterRole === r
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[12px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated / Inactive</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
            />
          </div>
        </div>
      </div>

      {/* ─── Users Roster Table ─────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="p-16 text-center text-[13px] text-[#737373]">Loading identity directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No users found</h3>
            <p className="text-[13px] text-[#737373]">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#737373] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#0a0a0a] whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-xs">
                          {u.name?.[0] || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#525252] whitespace-nowrap">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-[9999px] text-[11px] font-mono font-medium border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#525252]">
                      {u.department?.name || <span className="text-[#a3a3a3] italic">Unassigned</span>}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        ● {u.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737373] whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User"
                          className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded hover:bg-[#f0f0f0]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                          className={`p-1.5 rounded hover:bg-[#f0f0f0] ${
                            u.status === 'ACTIVE'
                              ? 'text-[#737373] hover:text-red-600'
                              : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create User Modal ───────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563eb]" />
                <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">Create User Account</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="sarah.connor@servicedesk.com"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    RBAC Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="MANAGER">IT Manager</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Department
                  </label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="">-- None --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
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
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit User Modal ─────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Edit User: {selectedUser.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="MANAGER">IT Manager</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Department</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                >
                  <option value="">-- None --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Deactivated</option>
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
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
