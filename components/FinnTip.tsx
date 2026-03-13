'use client'

import { motion } from 'framer-motion'
import FinnMascot from './FinnMascot'

interface FinnTipProps {
  tip: string
}

export default function FinnTip({ tip }: FinnTipProps) {
  return (
    <div className="px-6 mb-8 mt-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white flex items-center gap-4 relative overflow-hidden group"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex-shrink-0">
          <FinnMascot pose="wave" size={80} />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 leading-none">Finn's Tip</p>
          <p className="text-gray-900 font-bold text-sm leading-snug">
            "{tip}"
          </p>
        </div>
      </motion.div>
    </div>
  )
}
