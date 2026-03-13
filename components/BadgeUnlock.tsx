'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Award, Flame, Zap, Feather, Sun, Moon, Cloud, Trophy, LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import BadgeShield from './BadgeShield'

interface BadgeUnlockProps {
  badgeName: string
  show: boolean
  onClose: () => void
}

const BADGE_POOL = [
  { id: 'badge_first_steps', name: 'First Steps', icon: Feather, color: '#10b981' },
  { id: 'badge_fire_starter', name: 'Fire Starter', icon: Flame, color: '#f97316' },
  { id: 'badge_gamer', name: 'Mindful Gamer', icon: Zap, color: '#3b82f6' },
  { id: 'badge_clinical', name: 'Clinical Mind', icon: Cloud, color: '#6366f1' },
  { id: 'badge_steady', name: 'Steady Path', icon: Sun, color: '#a855f7' },
  { id: 'badge_zen', name: 'Zen Seeker', icon: Moon, color: '#78716c' },
  { id: 'badge_master', name: 'Mindful Master', icon: Trophy, color: '#eab308' },
]

export default function BadgeUnlock({ badgeName, show, onClose }: BadgeUnlockProps) {
  const [selectedBadge, setSelectedBadge] = useState(BADGE_POOL[0])

  useEffect(() => {
    if (show) {
      const random = BADGE_POOL[Math.floor(Math.random() * BADGE_POOL.length)]
      setSelectedBadge(random)
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="bg-white rounded-[3rem] p-10 shadow-3xl border-4 border-white flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div 
              className="absolute inset-x-0 top-0 h-64 opacity-20 blur-[80px]"
              style={{ background: selectedBadge.color }}
            />

            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8 relative z-10"
            >
              <BadgeShield 
                color={selectedBadge.color} 
                icon={selectedBadge.icon} 
                size="lg" 
              />
              
              {/* Achievement Sparkles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                   key={i}
                   animate={{ 
                     scale: [0, 1, 0],
                     x: [0, (Math.cos(i) * 100)],
                     y: [0, (Math.sin(i) * 100)],
                     opacity: [0, 1, 0]
                   }}
                   transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                   className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                   style={{ background: selectedBadge.color }}
                />
              ))}
            </motion.div>
            
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-3 z-10">Achievement Unlocked</h2>
            <h3 className="text-4xl font-black text-gray-900 mb-4 z-10 leading-tight tracking-tight">{selectedBadge.name}</h3>
            <p className="text-gray-500 font-bold mb-8 z-10 text-lg leading-snug px-4">
              Awesome work! Check your profile to see your growing collection.
            </p>
            
            <button
               onClick={onClose}
               className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all z-10 active:scale-95"
            >
              Got it!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
