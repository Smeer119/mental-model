'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface StreakNotificationProps {
  streak: number
  show: boolean
  onClose: () => void
}

export default function StreakNotification({ streak, show, onClose }: StreakNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[280px]"
        >
          <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-orange-100 flex flex-col items-center">
             <div className="relative mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center"
                >
                  <Flame className="w-10 h-10 text-orange-500 fill-orange-500" />
                </motion.div>
                
                {/* Sparkles around flame */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-20, -60],
                      x: [0, (i - 2.5) * 30],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
             </div>
             
             <h3 className="text-xl font-black text-gray-900 mb-1">STREAK UP!</h3>
             <p className="text-gray-500 font-bold mb-4">You're on fire!</p>
             
             <div className="flex items-center justify-center bg-orange-500 text-white rounded-2xl py-2 px-6 shadow-lg shadow-orange-500/30">
                <span className="text-3xl font-black mr-2">{streak}</span>
                <span className="text-sm font-bold uppercase tracking-widest">Days</span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
