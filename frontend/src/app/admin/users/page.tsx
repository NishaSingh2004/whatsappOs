export default function AdminUsersPage() {
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
            {[
              { name: "Nisha Singh", email: "admin@workos.com", org: "WorkOS Global", role: "SUPER_ADMIN", status: "Active" },
              { name: "Tony Stark", email: "tony@stark.com", org: "Stark Industries", role: "ORG_ADMIN", status: "Active" },
              { name: "Bruce Wayne", email: "bruce@wayne.ent", org: "Wayne Ent", role: "EMPLOYEE", status: "Suspended" },
            ].map((u, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mr-3 font-bold text-xs">
                      {u.name[0]}
                    </div>
                    <div>
                       <p className="font-medium text-gray-200">{u.name}</p>
                       <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{u.org}</td>
                <td className="px-6 py-4 text-gray-400">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-400 hover:text-indigo-300 font-medium">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
