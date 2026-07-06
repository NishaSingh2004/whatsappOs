"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    jira_base_url: "",
    jira_email: "",
    jira_api_token: ""
  });
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          jira_base_url: data.jira_base_url || "",
          jira_email: data.jira_email || ""
        }));
        setHasToken(data.has_api_token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // First, test connection
      setTesting(true);
      const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/settings/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      
      setTesting(false);
      
      if (!testRes.ok) {
        const error = await testRes.json();
        setStatus({ type: 'error', msg: error.detail || "Jira connection failed. Please check your credentials." });
        setLoading(false);
        return;
      }

      // If test succeeds, save the settings
      const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (saveRes.ok) {
        setStatus({ type: 'success', msg: "Settings saved and Jira connection verified!" });
        setFormData(prev => ({ ...prev, jira_api_token: "" })); // Clear token from state for security
        setHasToken(true);
      } else {
        const error = await saveRes.json();
        setStatus({ type: 'error', msg: error.detail || "Failed to save settings." });
      }
    } catch (e) {
      console.error(e);
      setStatus({ type: 'error', msg: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Integration Settings</h1>
        <p className="text-gray-400 mt-1">Configure your organization's external service connections.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f0f11] shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.53 2c.67.67 1.34 1.34 2 2 .54.54 1.07 1.07 1.6 1.61.16.16.31.33.47.49-.66.66-1.33 1.33-2 2-.54.54-1.07 1.07-1.6 1.61-.16.16-.32.33-.48.49.67.67 1.34 1.34 2.01 2.01.53.54 1.06 1.07 1.59 1.61.16.16.32.33.48.49.66-.66 1.33-1.33 2-2 .54-.54 1.07-1.07 1.6-1.61.16-.16.32-.33.48-.49-.67-.67-1.34-1.34-2.01-2.01-.53-.54-1.06-1.07-1.59-1.61-.16-.16-.32-.33-.48-.49zM6.9 7.64c.67.67 1.34 1.34 2.01 2.01.53.54 1.06 1.07 1.59 1.61.16.16.32.33.48.49-.66.66-1.33 1.33-2 2-.54.54-1.07 1.07-1.6 1.61-.16.16-.32.33-.48.49.67.67 1.34 1.34 2.01 2.01.53.54 1.06 1.07 1.59 1.61.16.16.32.33.48.49.66-.66 1.33-1.33 2-2 .54-.54 1.07-1.07 1.6-1.61.16-.16.32-.33.48-.49-.67-.67-1.34-1.34-2.01-2.01-.53-.54-1.06-1.07-1.59-1.61-.16-.16-.32-.33-.48-.49zM2.27 13.27c.67.67 1.34 1.34 2 2 .54.54 1.07 1.07 1.6 1.61.16.16.31.33.47.49-.66.66-1.33 1.33-2 2-.54.54-1.07 1.07-1.6 1.61-.16.16-.32.33-.48.49.67.67 1.34 1.34 2.01 2.01.53.54 1.06 1.07 1.59 1.61.16.16.32.33.48.49.66-.66 1.33-1.33 2-2 .54-.54 1.07-1.07 1.6-1.61.16-.16.32-.33.48-.49-.67-.67-1.34-1.34-2.01-2.01-.53-.54-1.06-1.07-1.59-1.61-.16-.16-.32-.33-.48-.49z"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Atlassian Jira Software</h2>
              <p className="text-sm text-gray-400">Sync projects and tasks seamlessly.</p>
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${hasToken ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
              {hasToken ? "Connected" : "Not Connected"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {status && (
            <div className={`p-4 rounded-lg border text-sm font-medium ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {status.msg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Jira Base URL</label>
              <input 
                required 
                type="url" 
                placeholder="https://your-domain.atlassian.net" 
                value={formData.jira_base_url} 
                onChange={e => setFormData({...formData, jira_base_url: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors" 
              />
              <p className="text-xs text-gray-500 mt-1.5">The URL you use to access your Jira workspace.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Jira Account Email</label>
              <input 
                required 
                type="email" 
                placeholder="admin@your-company.com" 
                value={formData.jira_email} 
                onChange={e => setFormData({...formData, jira_email: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Jira API Token</label>
              <input 
                required={!hasToken} 
                type="password" 
                placeholder={hasToken ? "••••••••••••••••••••••••" : "Paste your API token here"} 
                value={formData.jira_api_token} 
                onChange={e => setFormData({...formData, jira_api_token: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono" 
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Generate this from your <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" className="text-blue-400 hover:underline">Atlassian Security Settings</a>. 
                {hasToken && " Leave blank to keep your existing token."}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {testing ? "Testing Connection..." : "Saving..."}
                </>
              ) : "Save & Verify Connection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
