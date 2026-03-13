'use client'

import { motion } from 'framer-motion'

const moodData = [
  { day: 'Mon', level: 2, label: 'Neutral' },
  { day: 'Tue', level: 3, label: 'Calm' },
  { day: 'Wed', level: 1, label: 'Stressed' },
  { day: 'Thu', level: 2, label: 'Neutral' },
  { day: 'Fri', level: 3, label: 'Calm' },
  { day: 'Sat', level: 4, label: 'Excited' },
  { day: 'Sun', level: 5, label: 'Calm', highlight: true },
]

const maxLevel = 5
const moodLabels = ['', 'Stressed', 'Neutral', 'Calm', 'Excited', 'Calm']

export default function MoodTrendChart() {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Mood Trend</h2>
        </div>
        <div className="bg-[#714efe] text-white text-sm font-bold px-4 py-1.5 rounded-full">
          72% Calm
        </div>
      </div>

      {/* Y-axis labels + bars */}
      <div className="flex gap-3 items-end mb-3">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-32 text-[11px] text-gray-400 font-medium pr-1 pb-1">
          {[...moodLabels].reverse().slice(0, 4).map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end gap-2">
          {moodData.map((item, i) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.level / maxLevel) * 128}px` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                className={`w-full rounded-t-xl ${
                  item.highlight
                    ? 'bg-[#714efe]'
                    : 'bg-[#714efe]/20'
                }`}
                style={{
                  background: item.highlight
                    ? 'repeating-linear-gradient(135deg, #714efe 0px, #714efe 4px, #9d7ffb 4px, #9d7ffb 8px)'
                    : 'repeating-linear-gradient(135deg, #d9d4f7 0px, #d9d4f7 4px, #e8e4fc 4px, #e8e4fc 8px)',
                }}
              />
              <span className="text-[11px] text-gray-400 font-medium">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
