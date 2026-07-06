"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Invalid session");
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const allNavItems = [
    { name: "Overview", href: "/dashboard", roles: ["ORG_ADMIN", "MANAGER"] },
    { name: "Projects", href: "/dashboard/projects", roles: ["ORG_ADMIN", "MANAGER"] },
    { name: "Team Chat", href: "/dashboard/chat", roles: ["ORG_ADMIN", "MANAGER", "EMPLOYEE"] },
    { name: "Tasks", href: "/dashboard/tasks", roles: ["ORG_ADMIN", "MANAGER", "EMPLOYEE"] },
    { name: "Settings", href: "/dashboard/settings", roles: ["ORG_ADMIN", "MANAGER"] },
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0f0f11] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
             <span className="font-bold text-white text-lg">O</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-tight">My Workspace</span>
            <span className="text-xs text-gray-500">Enterprise Plan</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-sm font-bold shadow-lg">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="mt-4 w-full py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-[#0f0f11]/80 backdrop-blur-md">
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input type="text" placeholder="Search projects, tasks, messages..." className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
             </div>
          </div>
          <div className="flex items-center space-x-4">
             <button className="relative w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
