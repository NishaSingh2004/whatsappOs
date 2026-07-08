"use client";
import { useState, useEffect } from "react";

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: "", slug: "", plan: "Enterprise", 
    admin_email: "", admin_first_name: "", admin_last_name: "", admin_password: "" 
  });
  
  const [manageData, setManageData] = useState({
    name: "", slug: "", is_active: true
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/orgs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setOrgs(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/orgs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", slug: "", plan: "Enterprise", admin_email: "", admin_first_name: "", admin_last_name: "", admin_password: "" });
        fetchOrgs();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to create organization");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/orgs/${selectedOrg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(manageData)
      });
      if (res.ok) {
        setShowManageModal(false);
        fetchOrgs();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to update organization");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this organization and ALL its users? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/orgs/${selectedOrg.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        setShowManageModal(false);
        fetchOrgs();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to delete organization");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openManageModal = (org: any) => {
    setSelectedOrg(org);
    setManageData({ name: org.name, slug: org.slug, is_active: org.is_active });
    setShowManageModal(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all tenant organizations and their admins.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          + Add Organization & Admin
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs text-gray-400 font-medium uppercase tracking-wider">
              <th className="px-6 py-4">Organization Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {orgs.map((org, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white mr-3">
                      {org.name[0]}
                    </div>
                    {org.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{org.slug}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${org.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {org.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => openManageModal(org)} className="text-indigo-400 hover:text-indigo-300 font-medium mr-4">View Details</button>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No organizations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Add Organization & Admin</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              
              <div className="space-y-4 border-b border-white/5 pb-4">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Company Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Organization Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Tenant Slug (URL)</label>
                    <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Admin User Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                    <input required type="text" value={formData.admin_first_name} onChange={e => setFormData({...formData, admin_first_name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                    <input required type="text" value={formData.admin_last_name} onChange={e => setFormData({...formData, admin_last_name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Admin Email</label>
                  <input required type="email" value={formData.admin_email} onChange={e => setFormData({...formData, admin_email: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Admin Password</label>
                  <input required type="password" value={formData.admin_password} onChange={e => setFormData({...formData, admin_password: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div className="pt-6 flex space-x-3 justify-end border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  {loading ? "Creating..." : "Create Organization & Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Manage Organization</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Organization Name</label>
                <input required type="text" value={manageData.name} onChange={e => setManageData({...manageData, name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Tenant Slug (URL)</label>
                <input required type="text" value={manageData.slug} onChange={e => setManageData({...manageData, slug: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select value={manageData.is_active ? "true" : "false"} onChange={e => setManageData({...manageData, is_active: e.target.value === "true"})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none">
                  <option value="true">Active</option>
                  <option value="false">Suspended</option>
                </select>
              </div>

              <div className="pt-6 flex justify-between items-center border-t border-white/10">
                <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                   Delete Org
                </button>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setShowManageModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
