'use client'

import { motion } from 'framer-motion'

type ActivityEntry = {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data: ActivityEntry[]
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Generate last 100 days
  const cells = []
  const today = new Date()
  
  for (let i = 99; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = data.find(e => e.date === dateStr)
    cells.push({
      date: dateStr,
      count: entry?.count || 0
    })
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-emerald-200'
    if (count === 2) return 'bg-emerald-400'
    if (count >= 3) return 'bg-emerald-600'
    return 'bg-gray-100'
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-bold">Activity</h3>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last 100 Days</span>
      </div>
      
      <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
        {cells.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={`w-full aspect-square rounded-sm ${getIntensity(cell.count)} transition-colors cursor-help`}
            title={`${cell.count} activities on ${new Date(cell.date).toLocaleDateString()}`}
          />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-sm bg-gray-100" />
          <div className="w-2 h-2 rounded-sm bg-emerald-200" />
          <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          <div className="w-2 h-2 rounded-sm bg-emerald-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
