export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Overview</h1>
          <p className="text-indigo-100 max-w-2xl">
            Welcome to the WorkOS Global Operations Center. Monitor system health, manage tenant organizations, and analyze cross-org metrics.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Organizations", value: "24", trend: "+3 this month", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
          { label: "Total Users", value: "1,492", trend: "+12% vs last month", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
          { label: "AI Messages Processed", value: "84.2K", trend: "High load", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
          { label: "System Uptime", value: "99.99%", trend: "Stable", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl bg-gradient-to-br ${stat.color} border ${stat.border} p-6 backdrop-blur-sm relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300"></div>
            <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Recent Organizations</h3>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
             </div>
             <div className="space-y-4">
                {[
                  { name: "Acme Corp", slug: "acme", plan: "Enterprise", users: 450, status: "Active" },
                  { name: "GlobalTech", slug: "gtech", plan: "Growth", users: 120, status: "Active" },
                  { name: "Stark Industries", slug: "stark", plan: "Enterprise", users: 890, status: "Active" },
                ].map((org, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold mr-4 shadow-inner">
                        {org.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{org.name}</p>
                        <p className="text-xs text-gray-500">workos.com/org/{org.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="hidden sm:block text-gray-400">
                        {org.users} users
                      </div>
                      <div className="hidden sm:block">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {org.plan}
                        </span>
                      </div>
                      <div className="flex items-center text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        {org.status}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl">
             <h3 className="text-lg font-medium text-white mb-6">System Audit Log</h3>
             <div className="relative border-l border-gray-800 ml-3 space-y-6">
               {[
                 { action: "Org Created", target: "Stark Industries", time: "10 min ago", by: "Super Admin" },
                 { action: "Settings Updated", target: "Global OAuth", time: "1 hour ago", by: "Super Admin" },
                 { action: "Billing Sync", target: "Stripe Webhook", time: "2 hours ago", by: "System" },
                 { action: "New Super Admin", target: "Nisha Singh", time: "5 hours ago", by: "System" },
               ].map((log, i) => (
                 <div key={i} className="relative pl-6">
                   <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gray-600 ring-4 ring-[#0f0f11]"></div>
                   <p className="text-sm font-medium text-gray-300">{log.action}</p>
                   <p className="text-xs text-gray-500 mt-0.5">{log.target} • {log.time}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
