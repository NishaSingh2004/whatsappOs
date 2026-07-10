"use client";

import { useState } from "react";

export default function SuperAdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"official" | "experimental" | "architecture">("official");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">WhatsApp Integration Management</h1>
        <p className="text-gray-400 mt-1">Global monitor and configuration for all WhatsApp integrations across tenants.</p>
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("official")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "official" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Official WhatsApp API
          </button>
          <button
            onClick={() => setActiveTab("experimental")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
              activeTab === "experimental" ? "border-orange-500 text-orange-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            <span>WhatsApp Web Automation</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">Experimental</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "architecture" ? "border-emerald-500 text-emerald-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Architecture & Data Flow
          </button>
        </nav>
      </div>

      {activeTab === "official" && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             {[
               { label: "Connected Orgs", value: "14", color: "text-indigo-400" },
               { label: "Active Numbers", value: "26", color: "text-blue-400" },
               { label: "Total Messages", value: "1.2M", color: "text-purple-400" },
               { label: "Failed Messages", value: "0.02%", color: "text-red-400" },
             ].map((stat, i) => (
               <div key={i} className="p-6 rounded-xl border border-white/10 bg-[#0f0f11] shadow-lg">
                 <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
                 <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
               </div>
             ))}
           </div>

           <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-hidden">
             <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
               <h3 className="text-lg font-semibold text-white">Global Meta Configuration</h3>
               <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                 Save Global Settings
               </button>
             </div>
             <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Master Business Number</label>
                   <input type="text" value="+10000000000" readOnly className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/5 text-gray-400 focus:outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Master Webhook Secret</label>
                   <input type="password" value="secret_value_here" readOnly className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/5 text-gray-400 focus:outline-none" />
                 </div>
               </div>
               
               <div className="pt-4 border-t border-white/5">
                 <p className="text-sm text-gray-400 mb-4">The official API routes all traffic through the Meta Cloud API. Rate limits and billing are handled directly by Meta.</p>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-3 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                   <div>
                     <h4 className="text-emerald-400 font-medium">System Healthy</h4>
                     <p className="text-sm text-emerald-400/80 mt-0.5">Last Sync: 2 minutes ago. All webhooks are responding with 200 OK.</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === "experimental" && (
        <div className="space-y-6">
           <div className="rounded-xl border border-orange-500/30 bg-[#0f0f11] shadow-[0_0_30px_rgba(249,115,22,0.05)] overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/20">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400">Experimental WhatsApp Web Automation</h3>
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                      This option is strictly for internal development or proof-of-concept. <strong>It is not recommended for production SaaS deployments.</strong>
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-400 list-disc list-inside">
                      <li>Uses WhatsApp Web sessions via headless browsers or Baileys.</li>
                      <li>No official Meta API; unsupported by Meta.</li>
                      <li>Requires QR-code authentication for each connected session.</li>
                      <li>Sessions can expire or disconnect without warning.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-md font-medium text-white mb-4">Active Global Sessions</h4>
                <div className="rounded-lg border border-white/10 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/40 text-xs text-gray-400 font-medium uppercase tracking-wider">
                        <th className="px-4 py-3">Session ID</th>
                        <th className="px-4 py-3">Organization</th>
                        <th className="px-4 py-3">Connected Number</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Login Time</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-gray-300">sess_8f92j1</td>
                        <td className="px-4 py-3 text-gray-200">Stark Industries</td>
                        <td className="px-4 py-3 text-gray-400">+19876543210</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Connected</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">2 hours ago</td>
                        <td className="px-4 py-3 flex space-x-2">
                          <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-xs transition-colors border border-white/10">Refresh</button>
                          <button className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors border border-red-500/20">Disconnect</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-gray-300">sess_4a29k9</td>
                        <td className="px-4 py-3 text-gray-200">Wayne Ent</td>
                        <td className="px-4 py-3 text-gray-400">+11223344556</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Expired</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">3 days ago</td>
                        <td className="px-4 py-3 flex space-x-2">
                          <button className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded text-xs transition-colors border border-indigo-500/30">Generate QR</button>
                          <button className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors border border-red-500/20">Disconnect</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Official Architecture */}
             <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                 <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 mr-3">
                   1
                 </div>
                 Official WhatsApp Business API
               </h3>
               
               <div className="relative">
                 <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-indigo-500/30"></div>
                 <div className="space-y-6 relative z-10">
                   {[
                     { label: "Employee", desc: "Sends a message via WhatsApp on their phone." },
                     { label: "Meta Cloud API", desc: "Receives the message and forwards to our Webhook." },
                     { label: "FastAPI Backend", desc: "Validates Webhook signature and extracts message payload." },
                     { label: "Gemini AI", desc: "Processes natural language to determine intent (e.g. create task)." },
                     { label: "Jira / Database", desc: "Executes the required action." },
                     { label: "Response", desc: "Sends confirmation back to Employee via Meta API." },
                   ].map((step, i) => (
                     <div key={i} className="flex items-start">
                       <div className="w-12 h-12 rounded-xl bg-[#15151a] border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mr-4 shrink-0 shadow-lg">
                         {i + 1}
                       </div>
                       <div className="pt-1">
                         <h4 className="text-white font-medium">{step.label}</h4>
                         <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* Experimental Architecture */}
             <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                 <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 mr-3">
                   2
                 </div>
                 Experimental Web Automation
               </h3>
               
               <div className="relative">
                 <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-orange-500/30"></div>
                 <div className="space-y-6 relative z-10">
                   {[
                     { label: "Employee", desc: "Sends a message via WhatsApp." },
                     { label: "WhatsApp Web Session", desc: "Headless browser or Baileys client intercepts the message live." },
                     { label: "FastAPI Backend", desc: "Extracts message directly from the active socket session." },
                     { label: "Gemini AI", desc: "Processes natural language to determine intent." },
                     { label: "Jira / Database", desc: "Executes the required action." },
                     { label: "Response", desc: "Sends message back through the Web Session socket." },
                   ].map((step, i) => (
                     <div key={i} className="flex items-start">
                       <div className="w-12 h-12 rounded-xl bg-[#15151a] border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold mr-4 shrink-0 shadow-lg">
                         {i + 1}
                       </div>
                       <div className="pt-1">
                         <h4 className="text-white font-medium">{step.label}</h4>
                         <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-400/90 relative z-10">
                 <strong>Warning:</strong> This approach depends on an authenticated WhatsApp Web session and is intended only for internal testing. It is not suitable for production deployments because sessions may expire or become unavailable.
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
