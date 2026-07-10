"use client";

import { useState, useEffect } from "react";

const MOCK_MEMBERS = []; // Removed

const ROLES = ["EMPLOYEE", "MANAGER", "ORG_ADMIN", "TEAM_LEAD"];

export default function WhatsAppMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"added" | "invite">("added");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", empId: "", phone: "", department: "", team: "", designation: "", role: "EMPLOYEE" });
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  
  // Custom dropdown state
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  // Member profile state
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()));

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/whatsapp/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLink(`https://workos.company.com/invite/${Math.random().toString(36).substring(7).toUpperCase()}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WhatsApp Members</h1>
          <p className="text-gray-400 mt-1">Manage employee integrations and invitations for WhatsApp.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Invite Member
        </button>
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("added")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "added" ? "border-emerald-500 text-emerald-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Added Members
          </button>
        </nav>
      </div>

      {activeTab === "added" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
             <div className="flex flex-1 gap-4">
                <input type="text" placeholder="Search members by name, ID, or phone..." className="w-full sm:max-w-md px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" />
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filters
                </button>
             </div>
             <button onClick={fetchMembers} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10">
               Refresh
             </button>
             <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               Export CSV
             </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Emp ID</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Dept / Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Integration</th>
                  <th className="px-6 py-4">Last Seen</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading members...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No members connected yet. Have an employee scan the QR to start a chat!</td></tr>
                ) : members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => setSelectedMember(member)}>
                    <td className="px-6 py-4 font-medium text-gray-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center mr-3 font-bold border border-emerald-500/30 uppercase">
                          {member.name[0] || '?'}
                        </div>
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{member.empId}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono">{member.phone}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-200">{member.department}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="flex items-center text-xs font-medium text-gray-300">
                         <div className={`w-2 h-2 rounded-full mr-2 ${member.integrationStatus === 'Connected' ? 'bg-emerald-500' : member.integrationStatus === 'Disconnected' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                         {member.integrationStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{member.lastSeen}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end space-x-3">
                          <button className="text-gray-400 hover:text-white" title="Edit" onClick={(e) => e.stopPropagation()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button className="text-red-400 hover:text-red-300" title="Remove" onClick={(e) => e.stopPropagation()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
               <span>Showing {members.length} members</span>
               <div className="flex space-x-2">
                 <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Prev</button>
                 <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#15151a] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Invite WhatsApp Member</h2>
                <p className="text-sm text-gray-400 mt-1">Generate a secure link for your employee to join the workspace.</p>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                {inviteLink ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center space-y-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                     <h3 className="text-white font-medium text-lg">Invitation Generated</h3>
                     <p className="text-sm text-gray-400">Share this link with {inviteData.name}. Once they authenticate, they will appear in your Added Members list.</p>
                     <div className="flex items-center gap-2 mt-4 bg-black/40 p-1.5 rounded-lg border border-white/10">
                       <input readOnly value={inviteLink} className="flex-1 bg-transparent border-none text-emerald-400 text-sm px-3 focus:outline-none" />
                       <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors font-medium">Copy</button>
                     </div>
                  </div>
                ) : (
                  <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Employee Name</label>
                        <input required type="text" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Employee ID</label>
                        <input required type="text" value={inviteData.empId} onChange={e => setInviteData({...inviteData, empId: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number (WhatsApp)</label>
                      <input required type="text" placeholder="+1234567890" value={inviteData.phone} onChange={e => setInviteData({...inviteData, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Department</label>
                        <input type="text" value={inviteData.department} onChange={e => setInviteData({...inviteData, department: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Team</label>
                        <input type="text" value={inviteData.team} onChange={e => setInviteData({...inviteData, team: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Designation</label>
                      <input type="text" value={inviteData.designation} onChange={e => setInviteData({...inviteData, designation: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    
                    {/* Custom Searchable Dropdown for Role */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                      <div 
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus-within:border-emerald-500 cursor-pointer flex justify-between items-center"
                        onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      >
                         <span>{inviteData.role || "Select a role"}</span>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                      {roleDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                           <div className="p-2 border-b border-white/5">
                             <input 
                               autoFocus 
                               type="text" 
                               placeholder="Search roles..." 
                               value={roleSearch} 
                               onChange={e => setRoleSearch(e.target.value)} 
                               className="w-full bg-black/40 border border-white/5 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" 
                             />
                           </div>
                           <div className="max-h-40 overflow-y-auto p-1">
                             {filteredRoles.map(r => (
                               <div 
                                 key={r} 
                                 className="px-3 py-2 text-sm text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded cursor-pointer transition-colors"
                                 onClick={() => { setInviteData({...inviteData, role: r}); setRoleDropdownOpen(false); setRoleSearch(""); }}
                               >
                                 {r}
                               </div>
                             ))}
                             {filteredRoles.length === 0 && <div className="px-3 py-4 text-center text-sm text-gray-500">No roles found</div>}
                           </div>
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end space-x-3 bg-black/20">
                <button type="button" onClick={() => {setShowInviteModal(false); setInviteLink(null);}} className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  {inviteLink ? "Close" : "Cancel"}
                </button>
                {!inviteLink && (
                  <button type="submit" form="invite-form" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    Generate Link
                  </button>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#15151a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-white/5 to-transparent">
                 <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center mr-5 font-bold text-2xl border-2 border-emerald-500/30">
                      {selectedMember.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white leading-tight">{selectedMember.name}</h2>
                      <p className="text-sm text-emerald-400 font-medium">{selectedMember.role}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-500 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                       <div>
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Details</h4>
                         <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                           <div>
                             <p className="text-xs text-gray-500">Phone Number</p>
                             <p className="text-sm text-white font-mono">{selectedMember.phone}</p>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500">Joined Date</p>
                             <p className="text-sm text-white">{selectedMember.joined}</p>
                           </div>
                         </div>
                       </div>
                       
                       <div>
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Organization Details</h4>
                         <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                           <div>
                             <p className="text-xs text-gray-500">Employee ID</p>
                             <p className="text-sm text-white">{selectedMember.empId}</p>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500">Department</p>
                             <p className="text-sm text-white">{selectedMember.department}</p>
                           </div>
                         </div>
                       </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                       <div>
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Integration Status</h4>
                         <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                           <div className="flex justify-between items-center">
                             <p className="text-xs text-gray-500">WhatsApp Status</p>
                             <span className={`px-2 py-0.5 rounded text-xs font-medium border ${selectedMember.integrationStatus === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                               {selectedMember.integrationStatus}
                             </span>
                           </div>
                           <div className="flex justify-between items-center">
                             <p className="text-xs text-gray-500">System Status</p>
                             <span className={`px-2 py-0.5 rounded text-xs font-medium border ${selectedMember.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                               {selectedMember.status}
                             </span>
                           </div>
                         </div>
                       </div>
                       
                       <div>
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h4>
                         <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                           <div>
                             <p className="text-xs text-gray-500">Last Login</p>
                             <p className="text-sm text-white">{selectedMember.lastSeen}</p>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500">Recent Messages</p>
                             <p className="text-sm text-white">1,204 messages processed</p>
                           </div>
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
