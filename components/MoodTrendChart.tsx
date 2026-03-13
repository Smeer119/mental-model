'use client'

import { motion } from 'framer-motion'

export type TrendDataPoint = {
  day: string
  level: number
  label: string
  highlight: boolean
}

interface MoodTrendChartProps {
  trendData: TrendDataPoint[]
  weeklyTrendPercentage: string
}

const maxLevel = 5

export default function MoodTrendChart({ trendData = [], weeklyTrendPercentage = '0%' }: MoodTrendChartProps) {
  const getLevelColor = (level: number) => {
    if (level >= 4) return '#10b981' // emerald
    if (level === 3) return '#3b82f6' // blue
    if (level === 2) return '#f59e0b' // amber
    if (level === 1) return '#ef4444' // red
    return '#e5e7eb' // gray
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Emotional Wave</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily Overview</p>
        </div>
        <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-emerald-500/20">
          {weeklyTrendPercentage}
        </div>
      </div>

      <div className="flex gap-4 items-end min-h-[160px]">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-32 text-[10px] text-gray-300 font-extrabold pb-6 pr-2">
          {['HAPPY', 'CALM', 'FINE'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2">
          {trendData.length > 0 ? (
            trendData.map((item, i) => (
              <div key={item.day + (i).toString()} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full h-32 bg-gray-50 rounded-full relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.level / maxLevel) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                    className="absolute bottom-0 left-0 right-0 rounded-full"
                    style={{ 
                      backgroundColor: getLevelColor(item.level),
                      opacity: item.highlight ? 1 : 0.6
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                  {item.day}
                </span>
              </div>
            ))
          ) : (
            <div className="flex-1 h-32 flex items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
               <p className="text-gray-400 text-xs font-bold">Waiting for your first check-in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
