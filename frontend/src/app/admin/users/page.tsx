"use client";
import { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [manageData, setManageData] = useState({
    first_name: "", last_name: "", role: "", is_active: true
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/users/global`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const openManageModal = (user: any) => {
    setSelectedUser(user);
    setManageData({ 
      first_name: user.first_name, 
      last_name: user.last_name, 
      role: user.role, 
      is_active: user.is_active 
    });
    setShowManageModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(manageData)
      });
      if (res.ok) {
        setShowManageModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to update user");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        setShowManageModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to delete user");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Users</h1>
          <p className="text-sm text-gray-400 mt-1">Manage platform users across all tenants.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
           <input type="text" placeholder="Search users by email..." className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
           <button className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors">
             Export CSV
           </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs text-gray-400 font-medium uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mr-3 font-bold text-xs">
                      {u.first_name[0]}
                    </div>
                    <div>
                       <p className="font-medium text-gray-200">{u.first_name} {u.last_name}</p>
                       <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{u.org_name || "Unknown"}</td>
                <td className="px-6 py-4 text-gray-400">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${u.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {u.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => openManageModal(u)} className="text-indigo-400 hover:text-indigo-300 font-medium">Manage</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showManageModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Manage User: {selectedUser.first_name} {selectedUser.last_name}</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                  <input required type="text" value={manageData.first_name} onChange={e => setManageData({...manageData, first_name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                  <input required type="text" value={manageData.last_name} onChange={e => setManageData({...manageData, last_name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                <select value={manageData.role} onChange={e => setManageData({...manageData, role: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none">
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ORG_ADMIN">ORG_ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="TEAM_LEAD">TEAM_LEAD</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
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
                   Delete User
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
