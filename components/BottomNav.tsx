"use client";

import { Home, ClipboardList, Brain, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[420px] z-50">
      <div className="bg-[#e4e1e6]/90 backdrop-blur-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2 flex items-center justify-between border border-white/40">
        {/* 1. Home */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-[1.25rem] transition-colors",
            pathname === "/" ? "text-[#7a5af8] bg-white/50" : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
          )}
        >
          <Home className="w-[1.6rem] h-[1.6rem]" strokeWidth={2.5} />
        </Link>
        
        {/* 2. Assessment */}
        <Link
          href="/assessment"
          className={cn(
            "flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-[1.25rem] transition-colors",
            pathname === "/assessment" ? "text-[#7a5af8] bg-white/50" : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
          )}
        >
          <ClipboardList className="w-[1.6rem] h-[1.6rem]" strokeWidth={2.5} />
        </Link>

        {/* 3. Finn AI (Middle, Highlighted) */}
        <Link 
          href="/chat" 
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#8fa3f8] to-[#714efe] text-white shadow-lg transition-transform active:scale-95 border-2 border-[#e4e1e6]/90 relative -top-3",
            pathname === "/chat" && "scale-110 shadow-[0_0_20px_rgba(113,78,254,0.4)]"
          )}
        >
          <Brain className="w-6 h-6" strokeWidth={2.5} />
        </Link>

        {/* 4. Analysis */}
        <Link
          href="/analytics"
          className={cn(
            "flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-[1.25rem] transition-colors",
            pathname === "/analytics" ? "text-[#7a5af8] bg-white/50" : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
          )}
        >
          <BarChart2 className="w-[1.6rem] h-[1.6rem]" strokeWidth={2.5} />
        </Link>

        {/* 5. Profile */}
        <Link 
          href="/profile" 
          className={cn(
            "flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-[1.25rem] transition-colors",
            pathname === "/profile" ? "text-[#7a5af8] bg-white/50" : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
          )}
        >
          <User className="w-[1.6rem] h-[1.6rem]" strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  );
}
