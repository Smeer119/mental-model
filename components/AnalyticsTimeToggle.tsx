'use client'

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsTimeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("timeRange") || "week";
  const [isOpen, setIsOpen] = useState(false);

  const ranges = [
    { id: "day", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
  ];

  const handleSelect = (id: string) => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", id);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl shadow-sm text-sm font-semibold text-gray-700 border border-gray-100"
      >
        {ranges.find(r => r.id === currentRange)?.label || "This week"}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100]"
          >
            {ranges.map((range) => (
              <button
                key={range.id}
                onClick={() => handleSelect(range.id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                  currentRange === range.id ? "text-[#714efe] bg-purple-50 hover:bg-purple-100" : "text-gray-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
