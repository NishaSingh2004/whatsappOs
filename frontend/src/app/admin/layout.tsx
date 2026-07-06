"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "home" },
    { name: "Organizations", href: "/admin/orgs", icon: "building" },
    { name: "Users", href: "/admin/users", icon: "users" },
    { name: "Global Settings", href: "/admin/settings", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0f0f11] flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">WorkOS Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className={`w-5 h-5 mr-3 rounded flex items-center justify-center ${pathname === item.href ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pathname === item.href ? 'bg-indigo-400' : 'bg-gray-500'}`} />
              </div>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
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
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/10 bg-[#0f0f11]/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
             <button 
               className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
               onClick={() => setIsMobileMenuOpen(true)}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
             <h2 className="text-lg font-medium text-gray-200 truncate">
               {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
             </h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
               System Status: Operational
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
