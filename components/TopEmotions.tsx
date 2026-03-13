'use client'

import { motion } from 'framer-motion'

export type EmotionStat = {
  name: string
  percentage: string
  color: string
  emoji: string
}

interface TopEmotionsProps {
  emotions: EmotionStat[]
}

export default function TopEmotions({ emotions = [] }: TopEmotionsProps) {
  return (
    <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-white flex flex-col">
      <div className="mb-6">
        <h3 className="text-gray-900 font-black tracking-tight text-xl">Top Emotions</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Weekly Vibes</p>
      </div>
      
      <div className="space-y-6">
        {emotions.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-100">
             <p className="text-gray-400 text-xs font-bold">No moods logged this week.</p>
          </div>
        ) : (
          emotions.map((emotion, i) => (
            <div key={emotion.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-lg shadow-sm">
                    {emotion.emoji}
                  </div>
                  <span className="text-gray-900 font-extrabold text-sm uppercase tracking-tight">{emotion.name}</span>
                </div>
                <span className="text-gray-900 font-black text-xs bg-gray-50 px-3 py-1.5 rounded-full">{emotion.percentage}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: emotion.percentage }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: emotion.color.includes('#') ? emotion.color : undefined }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
