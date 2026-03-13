'use client'

import { motion } from 'framer-motion'

interface StreakFlameProps {
  streak: number
}

export default function StreakFlame({ streak }: StreakFlameProps) {
  return (
    <div className="bg-[#fff1cc] rounded-[2rem] p-6 flex flex-col justify-between aspect-square relative overflow-hidden group">
      {/* Animated Background Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl"
      />

      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm relative z-10">
        <div className="relative">
          {/* Flame Base */}
          <motion.div
            animate={{ 
              scaleY: [1, 1.2, 1],
              skewX: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-2xl"
          >
            🔥
          </motion.div>
          
          {/* Sparkles */}
          <AnimateSparkles />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-gray-900 font-bold mb-1">Daily Streak</p>
        <div className="flex items-baseline">
          <span className="text-5xl font-black text-orange-500 drop-shadow-sm">{streak}</span>
          <span className="text-sm text-orange-400 font-bold ml-2 uppercase tracking-tighter">Days</span>
        </div>
      </div>
    </div>
  )
}

function AnimateSparkles() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [-10, -30],
            x: [0, (i - 1) * 15],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: i * 0.4,
            ease: "easeOut"
          }}
          className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
        />
      ))}
    </>
  )
}
