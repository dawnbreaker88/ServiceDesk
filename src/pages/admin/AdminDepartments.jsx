import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Users,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDepartments() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
  });
  const [creating, setCreating] = useState(false);

  const [editDept, setEditDept] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
  });
  const [updating, setUpdating] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/departments');
      if (res.success) setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepts = departments.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) {
      toast.warning('Department name and code are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await apiRequest('/departments', {
        method: 'POST',
        body: JSON.stringify(newDept),
      });

      if (res.success) {
        toast.success(`Department ${newDept.name} created!`);
        setShowCreateModal(false);
        setNewDept({ name: '', code: '', description: '', location: '' });
        await loadDepartments();
      }
    } catch (err) {
      toast.error('Failed to create department: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setEditDept({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      location: dept.location || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/departments/${selectedDept._id}`, {
        method: 'PATCH',
        body: JSON.stringify(editDept),
      });

      if (res.success) {
        toast.success(`Department ${selectedDept.name} updated.`);
        setShowEditModal(false);
        setSelectedDept(null);
        await loadDepartments();
      }
    } catch (err) {
      toast.error('Failed to update department: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Company Departments</h1>
          <p className="text-[13px] text-[#737373]">
            Manage enterprise organizational structure, cost centers, and departmental staffing
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* ─── Search Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[14px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      {/* ─── Departments Grid ───────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-16 text-center text-[13px] text-[#737373]">
            Loading departments...
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="col-span-full p-16 text-center">
            <Building2 className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No departments found</h3>
            <p className="text-[13px] text-[#737373]">Add your company's organizational units.</p>
          </div>
        ) : (
          filteredDepts.map((d) => (
            <div
              key={d._id}
              className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#0a0a0a] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold bg-[#fafafa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[#0a0a0a]">
                  {d.code}
                </span>
                <button
                  onClick={() => handleOpenEdit(d)}
                  className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded hover:bg-[#fafafa]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="font-display font-semibold text-[15px] text-[#0a0a0a]">{d.name}</h3>
                <p className="text-[12px] text-[#737373] mt-1 line-clamp-2">
                  {d.description || 'Enterprise department'}
                </p>
              </div>

              {d.location && (
                <div className="text-[11px] text-[#737373] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#a3a3a3]" />
                  <span>{d.location}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ─── Create Department Modal ─────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">Create Department</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Engineering & Platform"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ENG"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Location / Office
                </label>
                <input
                  type="text"
                  value={newDept.location}
                  onChange={(e) => setNewDept({ ...newDept, location: e.target.value })}
                  placeholder="e.g. HQ - Floor 4"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
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
                  className="px-6 py-2 bg-[#0a0a0a] text-white font-medium rounded-[8px]"
                >
                  {creating ? 'Saving...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Department Modal ───────────────────────────────────── */}
      {showEditModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Edit Department: {selectedDept.name}
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
                  value={editDept.name}
                  onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Location</label>
                <input
                  type="text"
                  value={editDept.location}
                  onChange={(e) => setEditDept({ ...editDept, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
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
                  {updating ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
