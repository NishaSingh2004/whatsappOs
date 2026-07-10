"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function WhatsAppIntegrationPage() {
  const [activeTab, setActiveTab] = useState<"official" | "experimental">("official");
  const [experimentalEnabled, setExperimentalEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Status state
  const [status, setStatus] = useState({
    isConnected: false,
    lastSync: "Never",
    activeUsers: 0,
    totalMessages: 0,
    integrationType: "None"
  });

  // Official API state
  const [officialData, setOfficialData] = useState({
    businessName: "",
    phoneNumber: "",
    appId: "",
    appSecret: "",
    accessToken: "",
    verifyToken: "",
    webhookUrl: "https://api.workos.com/webhook/whatsapp/org_id",
    webhookSecret: ""
  });
  
  const [officialStatus, setOfficialStatus] = useState<"Not Connected" | "Connected" | "Invalid Token" | "Waiting Verification">("Not Connected");

  // Experimental state
  const [experimentalStatus, setExperimentalStatus] = useState<"Logged Out" | "Waiting for QR Scan" | "Connected" | "Session Expired">("Logged Out");

  const handleOfficialConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setOfficialStatus("Waiting Verification");
      setStatus({ ...status, isConnected: false, integrationType: "Official API (Pending)" });
      setLoading(false);
    }, 1000);
  };

  const wsRef = useRef<WebSocket | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  const handleGenerateQR = () => {
    setLoading(true);
    setExperimentalStatus("Waiting for QR Scan");
    setQrData(null);
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Connect to WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/api/v1/whatsapp/ws/qr';
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        if (data.message === 'Connected') {
          setExperimentalStatus("Connected");
          setQrData(null);
        } else if (data.message === 'Session Expired') {
          setExperimentalStatus("Session Expired");
        } else {
          setExperimentalStatus("Waiting for QR Scan");
        }
      } else if (data.type === 'qr_code') {
        setQrData(data.data);
        setLoading(false);
      }
    };
    
    ws.onerror = () => {
      setLoading(false);
      setExperimentalStatus("Logged Out");
    };
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">WhatsApp Integration</h1>
        <p className="text-gray-400 mt-1">Connect your workspace to WhatsApp to enable AI-powered team collaboration.</p>
      </div>

      {/* Integration Status Card */}
      <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${status.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-500'}`}></div>
              <span className={`font-semibold ${status.isConnected ? 'text-emerald-400' : 'text-gray-300'}`}>
                {status.isConnected ? "Connected" : "Not Connected"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Integration Type</p>
            <p className="font-semibold text-gray-200">{status.integrationType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Sync</p>
            <p className="font-semibold text-gray-200">{status.lastSync}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Users</p>
            <p className="font-semibold text-gray-200">{status.activeUsers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Messages</p>
            <p className="font-semibold text-gray-200">{status.totalMessages}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("official")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "official"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Official WhatsApp API
          </button>
          <button
            onClick={() => setActiveTab("experimental")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
              activeTab === "experimental"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            <span>WhatsApp Web Automation</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">Experimental</span>
          </button>
        </nav>
      </div>

      {/* Option A: Official */}
      {activeTab === "official" && (
        <div className="space-y-6">
           <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-hidden">
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Meta Business Configuration</h3>
                  <p className="text-sm text-gray-400 mt-1">Configure your official WhatsApp Business API credentials.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${officialStatus === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : officialStatus === 'Waiting Verification' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : officialStatus === 'Invalid Token' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {officialStatus}
                  </span>
                </div>
             </div>
             
             <form onSubmit={handleOfficialConnect} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Business Name</label>
                    <input type="text" placeholder="Acme Corp" value={officialData.businessName} onChange={e => setOfficialData({...officialData, businessName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Business Phone Number</label>
                    <input type="text" placeholder="+1234567890" value={officialData.phoneNumber} onChange={e => setOfficialData({...officialData, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Meta App ID</label>
                    <input type="text" placeholder="123456789012345" value={officialData.appId} onChange={e => setOfficialData({...officialData, appId: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Meta App Secret</label>
                    <input type="password" placeholder="••••••••••••••••" value={officialData.appSecret} onChange={e => setOfficialData({...officialData, appSecret: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Permanent Access Token</label>
                    <textarea placeholder="EAAGm0..." value={officialData.accessToken} onChange={e => setOfficialData({...officialData, accessToken: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors h-24 resize-none" required />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-semibold text-white mb-4">Webhook Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Webhook URL (Read Only)</label>
                      <input type="text" value={officialData.webhookUrl} readOnly className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Verify Token</label>
                      <input type="text" placeholder="Your custom verify token" value={officialData.verifyToken} onChange={e => setOfficialData({...officialData, verifyToken: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors" required />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                   <button type="button" className="px-6 py-2.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium transition-colors text-sm">
                     Disconnect
                   </button>
                   <button type="button" className="px-6 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 font-medium transition-colors text-sm">
                     Test Connection
                   </button>
                   <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors text-sm disabled:opacity-50">
                     {loading ? "Connecting..." : "Connect"}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Option B: Experimental */}
      {activeTab === "experimental" && (
        <div className="space-y-6">
           <div className="rounded-xl border border-orange-500/30 bg-[#0f0f11] shadow-[0_0_30px_rgba(249,115,22,0.05)] overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/20">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400">Experimental Feature Warning</h3>
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                      This option is only for internal development or testing. <strong>Do NOT present it as production ready.</strong>
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-400 list-disc list-inside">
                      <li>Uses WhatsApp Web login.</li>
                      <li>No official API.</li>
                      <li>Requires QR Code login.</li>
                      <li>Session may expire.</li>
                      <li>Meta does not officially support this approach.</li>
                      <li>Account restrictions may occur.</li>
                      <li>Not recommended for enterprise production.</li>
                    </ul>

                    <div className="mt-6 flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={experimentalEnabled} onChange={(e) => setExperimentalEnabled(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        <span className="ml-3 text-sm font-medium text-white">Enable Experimental Mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {experimentalEnabled && (
                <div className="p-6">
                   <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                     <div className="flex-1 space-y-6 w-full">
                       <div>
                         <p className="text-sm text-gray-500 mb-1">Connection Status</p>
                         <div className="flex items-center space-x-3">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                             experimentalStatus === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                             experimentalStatus === 'Waiting for QR Scan' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                             experimentalStatus === 'Session Expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                             'bg-gray-500/10 text-gray-400 border-gray-500/20'
                           }`}>
                             {experimentalStatus}
                           </span>
                         </div>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-white/5">
                         <button onClick={handleGenerateQR} disabled={loading} className="px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors text-sm disabled:opacity-50">
                           {loading ? "Generating..." : "Generate QR Code"}
                         </button>
                         <button type="button" className="px-6 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 font-medium transition-colors text-sm">
                           Refresh Session
                         </button>
                         <button type="button" className="px-6 py-2.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium transition-colors text-sm">
                           Logout Session
                         </button>
                       </div>
                     </div>

                     {/* Mock QR Code Display */}
                     <div className="w-64 h-64 border-2 border-dashed border-white/10 rounded-xl bg-black/50 flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {experimentalStatus === "Waiting for QR Scan" ? (
                          <>
                            <div className="w-48 h-48 bg-white p-2 rounded-lg">
                               {qrData ? (
                                 <QRCodeSVG value={qrData} size={176} />
                               ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                                   <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                   <p className="text-xs text-gray-500 font-medium">Fetching QR...</p>
                                 </div>
                               )}
                            </div>
                          </>
                        ) : experimentalStatus === "Connected" ? (
                          <div className="text-emerald-400 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <span className="mt-4 font-medium text-sm">Session Active</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm text-center px-4">Click "Generate QR Code" to start a new session</span>
                        )}
                     </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
