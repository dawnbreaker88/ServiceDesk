import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Tag,
  Laptop,
  Wifi,
  Lock,
  Mail,
  HelpCircle,
} from 'lucide-react';

export default function AdminCategories() {
  const { toast, confirm } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Forms
  const [newCat, setNewCat] = useState({
    name: '',
    code: '',
    description: '',
    defaultPriority: 'MEDIUM',
    icon: 'Folder',
    active: true,
  });
  const [creating, setCreating] = useState(false);

  const [editCat, setEditCat] = useState({
    name: '',
    code: '',
    description: '',
    defaultPriority: 'MEDIUM',
    icon: 'Folder',
    active: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/categories');
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.code) {
      toast.warning('Category name and code are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(newCat),
      });

      if (res.success) {
        toast.success(`Category ${newCat.name} created!`);
        setShowCreateModal(false);
        setNewCat({
          name: '',
          code: '',
          description: '',
          defaultPriority: 'MEDIUM',
          icon: 'Folder',
          active: true,
        });
        await loadCategories();
      }
    } catch (err) {
      toast.error('Failed to create category: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setEditCat({
      name: cat.name || '',
      code: cat.code || '',
      description: cat.description || '',
      defaultPriority: cat.defaultPriority || 'MEDIUM',
      icon: cat.icon || 'Folder',
      active: cat.active !== false,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/categories/${selectedCategory._id}`, {
        method: 'PATCH',
        body: JSON.stringify(editCat),
      });

      if (res.success) {
        toast.success(`Category ${selectedCategory.name} updated.`);
        setShowEditModal(false);
        setSelectedCategory(null);
        await loadCategories();
      }
    } catch (err) {
      toast.error('Failed to update category: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (catId) => {
    const ok = await confirm({
      title: 'Deactivate / Delete Category?',
      message: 'Are you sure you want to deactivate or remove this ticket category from active triage?',
      confirmText: 'Delete Category',
      isDestructive: true,
    });
    if (!ok) return;

    try {
      const res = await apiRequest(`/categories/${catId}`, { method: 'DELETE' });
      if (res.success) {
        toast.success('Category updated.');
        await loadCategories();
      }
    } catch (err) {
      toast.error('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Ticket Categories & Taxonomy</h1>
          <p className="text-[13px] text-[#737373]">
            Configure support categories, auto-routing rules, default priority levels, and triage classification
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
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
            placeholder="Search category name or code..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[6px] text-[13px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
          />
        </div>
      </div>

      {/* ─── Categories Grid ────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-16 text-center text-[13px] text-[#737373]">
            Loading taxonomy categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full p-16 text-center">
            <FolderTree className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No categories match</h3>
            <p className="text-[13px] text-[#737373]">Create your first ticket category to get started.</p>
          </div>
        ) : (
          filteredCategories.map((c) => (
            <div
              key={c._id}
              className="bg-[#ffffff] border border-[#e5e5e5] rounded-[16px] p-5 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#0a0a0a] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold bg-[#fafafa] border border-[#e5e5e5] px-2 py-0.5 rounded text-[#0a0a0a]">
                  {c.code}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded hover:bg-[#fafafa]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 text-[#737373] hover:text-red-600 rounded hover:bg-[#fafafa]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-[15px] text-[#0a0a0a]">{c.name}</h3>
                <p className="text-[12px] text-[#737373] mt-1 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f5f5f5] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#737373]">
                  Default Priority: <strong className="text-[#0a0a0a]">{c.defaultPriority || 'MEDIUM'}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded ${c.active !== false ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100'}`}>
                  ● {c.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Create Category Modal ───────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">Create Ticket Category</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Identity & Access"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCat.code}
                  onChange={(e) => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. IAM"
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Password resets, SSO issues, MFA tokens..."
                  className="w-full p-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Default Priority
                  </label>
                  <select
                    value={newCat.defaultPriority}
                    onChange={(e) => setNewCat({ ...newCat, defaultPriority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                    placeholder="Folder"
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px] font-mono"
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
                  className="px-6 py-2 bg-[#0a0a0a] text-white font-medium rounded-[8px]"
                >
                  {creating ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Category Modal ─────────────────────────────────────── */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#e5e5e5] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <h3 className="font-display font-semibold text-lg text-[#0a0a0a]">
                Edit Category: {selectedCategory.name}
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
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editCat.description}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  className="w-full p-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Default Priority</label>
                  <select
                    value={editCat.defaultPriority}
                    onChange={(e) => setEditCat({ ...editCat, defaultPriority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-[11px] text-[#737373] mb-1">Status</label>
                  <select
                    value={editCat.active ? 'true' : 'false'}
                    onChange={(e) => setEditCat({ ...editCat, active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-[8px]"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
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
                  {updating ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
