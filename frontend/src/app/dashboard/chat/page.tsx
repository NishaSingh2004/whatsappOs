"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // Fetch user info to know who is "Me"
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        setCurrentUser(await userRes.json());
      }
      
      // Fetch org chat messages
      fetchMessages();
    };
    init();
    
    // Poll for new messages every 5 seconds (Simple real-time simulation)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const history = await msgRes.json();
        const formatted = history.map((m: any) => ({
          id: m.id,
          sender: m.is_ai ? 'WorkOS AI' : (m.user ? `${m.user.first_name} ${m.user.last_name}` : 'Unknown'),
          role: m.is_ai ? 'assistant' : 'user',
          isMe: currentUser && m.user && m.user.first_name === currentUser.first_name, // Simple comparison
          content: m.content,
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
        setMessages(formatted);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const userInput = input;
    setInput("");
    
    // Optimistic UI update
    const newMsg = {
      id: Date.now().toString(),
      sender: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "You",
      role: "user",
      isMe: true,
      content: userInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: userInput
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      // Fetch latest messages to get AI response or DB generated ID
      await fetchMessages();
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "System",
        role: "assistant",
        isMe: false,
        content: "Message failed to send.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl border border-white/10 bg-[#0f0f11] shadow-2xl overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Team Chat</h2>
            <div className="flex items-center text-xs text-emerald-400 font-medium">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></div>
               Company Wide &middot; Mention @WorkOS for AI
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-[#15151a]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-medium text-gray-300">Welcome to Team Chat</p>
            <p className="text-sm mt-1 max-w-md text-center">Say hello to your team, or type @WorkOS to ask the AI to assign a Jira task!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.isMe 
                  ? 'ml-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                  : msg.role === 'assistant' ? 'mr-3 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'mr-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              }`}>
                {msg.isMe ? 'Me' : msg.role === 'assistant' ? 'AI' : msg.sender[0]}
              </div>
              
              <div>
                <div className={`flex items-baseline space-x-2 mb-1 ${msg.isMe ? 'justify-end' : ''}`}>
                  <span className="text-sm font-medium text-gray-200">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                
                <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                  msg.isMe 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none' 
                    : msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tl-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.content.split('\n').map((line: string, i: number) => (
                    <p key={i} className={line === '' ? 'h-4' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="flex max-w-[80%] flex-row-reverse">
              <div className="w-8 h-8 ml-3 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-500 text-white">Me</div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-200 rounded-tr-none flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: "0.2s"}}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: "0.4s"}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative flex items-end max-w-4xl mx-auto">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            disabled={isLoading}
            placeholder="Type a message or @WorkOS for AI..."
            className="w-full bg-[#1a1a1f] border border-white/10 rounded-2xl pl-4 pr-14 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none max-h-32 min-h-[50px] disabled:opacity-50"
            rows={1}
          />
          
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-1.5 p-2 rounded-xl bg-emerald-500 text-white disabled:opacity-50 disabled:bg-gray-700 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
