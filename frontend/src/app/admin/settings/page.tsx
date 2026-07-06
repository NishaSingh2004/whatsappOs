export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Global Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure platform-wide settings and integrations.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl">
          <h2 className="text-lg font-medium text-white mb-4">Authentication</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-gray-200">Enforce Multi-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-1">Require all users across all tenants to use MFA.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-gray-200">Single Sign-On (SSO)</p>
                  <p className="text-xs text-gray-500 mt-1">Allow tenants to configure SAML/OIDC providers.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
             </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 shadow-xl">
          <h2 className="text-lg font-medium text-white mb-4">AI Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Gemini API Key</label>
              <input type="password" value="************************" readOnly className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Model</label>
              <select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none appearance-none">
                <option>gemini-2.5-flash</option>
                <option>gemini-2.5-pro</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors mt-2">
              Save AI Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
