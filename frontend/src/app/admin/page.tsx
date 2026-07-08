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
          { label: "Active Organizations", value: "0", trend: "0 this month", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
          { label: "Total Users", value: "0", trend: "0% vs last month", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
          { label: "AI Messages Processed", value: "0", trend: "Normal load", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
          { label: "System Uptime", value: "100%", trend: "Stable", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
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
                <div className="p-4 text-center text-sm text-gray-500">No recent organizations.</div>
             </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl">
             <h3 className="text-lg font-medium text-white mb-6">System Audit Log</h3>
             <div className="relative ml-3 space-y-6">
               <div className="text-sm text-gray-500">No recent audit logs.</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
