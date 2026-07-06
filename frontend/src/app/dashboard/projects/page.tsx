"use client";
import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", jira_key: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/projects`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setProjects(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", jira_key: "", description: "" });
        fetchProjects();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to create project");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your team's projects and Jira integrations.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-[#0f0f11] p-6 hover:border-emerald-500/30 transition-colors group cursor-pointer shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-emerald-400 font-bold group-hover:bg-emerald-500/10 transition-colors">
                {proj.jira_key}
              </div>
              <span className="px-2 py-1 rounded text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {proj.status || "Active"}
              </span>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">{proj.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{proj.description || "Synced with Jira"}</p>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-emerald-400">0%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `0%` }}></div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
              No projects found. Create one to sync with Jira!
           </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Jira Project Key (e.g., WEB)</label>
                <input required type="text" maxLength={10} value={formData.jira_key} onChange={e => setFormData({...formData, jira_key: e.target.value.toUpperCase()})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="pt-4 flex space-x-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                  {loading ? "Syncing to Jira..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
