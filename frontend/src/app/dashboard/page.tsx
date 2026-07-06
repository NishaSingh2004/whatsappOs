"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TenantDashboard() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", first_name: "", last_name: "", role: "EMPLOYEE" });
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const user = await res.json();
        if (user.role === "EMPLOYEE") {
          router.push("/dashboard/chat");
        }
      }
    };
    fetchUser();
  }, [router]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/users/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(inviteData)
      });
      if (res.ok) {
        const data = await res.json();
        setInviteLink(data.invite_link);
        setInviteData({ email: "", first_name: "", last_name: "", role: "EMPLOYEE" });
        // Don't close modal, let them copy the link
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to send invite");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Workspace Overview</h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your organization today.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors">
            Invite Team
          </button>
          <a href="/dashboard/projects" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all inline-block">
            New Project
          </a>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Projects & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Active Projects", value: "12", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "My Tasks", value: "8", color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Unread Messages", value: "24", color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/10 bg-[#0f0f11] shadow-lg">
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Projects */}
          <div className="rounded-xl border border-white/10 bg-[#0f0f11] overflow-hidden shadow-xl">
             <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-medium text-white">Active Projects</h3>
                <a href="/dashboard/projects" className="text-sm text-gray-400 hover:text-white">View All</a>
             </div>
             <div className="divide-y divide-white/5">
                {[
                  { name: "Q3 Marketing Campaign", status: "In Progress", progress: 65, team: 4 },
                  { name: "Website Redesign", status: "Review", progress: 90, team: 6 },
                  { name: "API Integration v2", status: "Planning", progress: 15, team: 3 },
                ].map((proj, i) => (
                  <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-200">{proj.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{proj.team} members assigned</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{proj.status}</span>
                          <span className="text-emerald-400">{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Activity */}
        <div className="space-y-6">
          {/* WorkOS AI Mini Chat */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-[#15151a] to-[#0f0f11] shadow-xl overflow-hidden flex flex-col h-[400px]">
             <div className="p-4 border-b border-white/10 flex items-center bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12 2.1 12"/><path d="M12 12 21.9 12"/><path d="M12 12 12 21.9"/><path d="M12 12 12 2.1"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">WorkOS AI</h3>
                  <p className="text-xs text-emerald-400">Online</p>
                </div>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 w-10/12">
                   Hello! I've analyzed your Jira tasks for today. You have 2 high-priority bugs to fix in the Website Redesign project.
                </div>
             </div>
             <div className="p-3 border-t border-white/10 bg-black/20">
                <a href="/dashboard/chat" className="block text-center text-sm text-emerald-400 hover:text-emerald-300 font-medium py-2">
                   Open Full Chat &rarr;
                </a>
             </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              {inviteLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-400 font-medium mb-2">Invitation generated successfully! Share this link with the employee:</p>
                    <div className="flex items-center gap-2">
                      <input readOnly value={inviteLink} className="w-full px-3 py-2 text-sm rounded bg-black/40 border border-white/10 text-gray-300 focus:outline-none" />
                      <button type="button" onClick={() => navigator.clipboard.writeText(inviteLink)} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors">Copy</button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setInviteLink(null); setShowInviteModal(false); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
                      <input required type="text" value={inviteData.first_name} onChange={e => setInviteData({...inviteData, first_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
                      <input required type="text" value={inviteData.last_name} onChange={e => setInviteData({...inviteData, last_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                    <input required type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                    <select value={inviteData.role} onChange={e => setInviteData({...inviteData, role: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none appearance-none">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ORG_ADMIN">Org Admin</option>
                    </select>
                  </div>
                  <div className="pt-4 flex space-x-3 justify-end">
                    <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                      {loading ? "Generating..." : "Generate Invite Link"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
