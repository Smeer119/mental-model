'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Zap, ChevronRight } from 'lucide-react'
import PremiumModal from './PremiumModal'

export default function AnalyticsGate() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 bg-purple-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-purple-500/10"
      >
        <Lock className="w-10 h-10 text-purple-600" />
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Analytics</h2>
      <p className="text-gray-500 max-w-xs mb-10 leading-relaxed">
        Get deep insights into your mental wellbeing with advanced mood tracking and trend analysis.
      </p>

      <div className="w-full max-w-sm space-y-3 mb-12">
        {[
          { icon: "📈", label: "Long-term Mood Trends" },
          { icon: "🧠", label: "Emotional Correlation Analysis" },
          { icon: "📊", label: "Clinical Assessment History" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-gray-700 font-medium text-left flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full max-w-xs py-4 bg-[#714efe] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:bg-[#5f3ddb] transition-all flex items-center justify-center gap-2"
      >
        Unlock Now <Zap className="w-5 h-5 fill-white" />
      </button>

      <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
