'use client'

import { Calendar, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface WeeklyCheckInProps {
  daysLogged: number;
}

export default function WeeklyCheckIn({ daysLogged = 0 }: WeeklyCheckInProps) {
  const percentage = (daysLogged / 7) * 100;

  return (
    <div className="flex-1 bg-white rounded-[2.5rem] p-6 flex flex-col justify-between aspect-square shadow-sm border border-white overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />

      <div className="flex justify-between items-start relative z-10">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
        
        {/* Modern Mini-Progress */}
        <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-100"
                />
                <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={125.6}
                    initial={{ strokeDashoffset: 125.6 }}
                    animate={{ strokeDashoffset: 125.6 - (125.6 * percentage) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="text-purple-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-purple-600">
                {Math.round(percentage)}%
            </div>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Weekly Persistence</p>
        <div className="flex items-end gap-1.5">
          <span className="text-5xl font-black text-gray-900 leading-none">{daysLogged}</span>
          <span className="text-lg text-gray-300 font-bold mb-1">/ 7</span>
          {daysLogged >= 7 && (
             <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1 ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
