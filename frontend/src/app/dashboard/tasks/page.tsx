"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/projects/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Jira rest/api/3/search returns an object with an 'issues' array
          if (data && data.issues) {
            setTasks(data.issues);
          } else if (Array.isArray(data)) {
            setTasks(data);
          }
        } else {
          setError("Failed to fetch tasks from Jira.");
        }
      } catch (e) {
        setError("Error connecting to server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [router]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your assigned Jira tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isLoading ? (
             <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6 text-center">
               <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-gray-400">Syncing with Jira...</p>
             </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <p className="text-red-400">{error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-[#15151a] border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
              <p className="text-gray-400">You don't have any pending tasks right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task: any, i: number) => (
                <div key={i} className="bg-[#15151a] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {task.key || "TASK"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {task.fields?.issuetype?.name || "Task"}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {task.fields?.summary || "Untitled Task"}
                        </h4>
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                          {task.fields?.description?.content?.[0]?.content?.[0]?.text || "No description provided."}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        task.fields?.status?.name === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                        task.fields?.status?.name === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-white/10 text-gray-300'
                      }`}>
                        {task.fields?.status?.name || "To Do"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#15151a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Task Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Tasks</span>
                <span className="text-white font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Completed</span>
                <span className="text-emerald-400 font-medium">
                  {tasks.filter(t => t.fields?.status?.name === 'Done').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">In Progress</span>
                <span className="text-blue-400 font-medium">
                  {tasks.filter(t => t.fields?.status?.name === 'In Progress').length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-medium text-white mb-2 relative z-10">AI Assistant</h3>
            <p className="text-sm text-gray-300 mb-4 relative z-10">
              Need help managing these tasks? Go to Team Chat and type <strong>@WorkOS</strong> to ask the AI to update your Jira board!
            </p>
            <button onClick={() => router.push('/dashboard/chat')} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors relative z-10">
              Open Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
