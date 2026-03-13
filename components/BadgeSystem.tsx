'use client'

import { motion } from 'framer-motion'
import { Award, Flame, Zap, Feather, Sun, Moon, Cloud, Trophy, LucideIcon } from 'lucide-react'
import BadgeShield from './BadgeShield'

export type Badge = {
  id: string
  name: string
  description: string
  earnedAt: string
  color: string
}

interface BadgeSystemProps {
  badges: Badge[]
}

const ALL_BADGES: { id: string; name: string; description: string; icon: LucideIcon; color: string }[] = [
  { id: 'badge_first_steps', name: 'First Steps', description: 'Your journey begins.', icon: Feather, color: '#10b981' }, // Emerald
  { id: 'badge_fire_starter', name: 'Fire Starter', description: '3 day streak reached!', icon: Flame, color: '#f97316' }, // Orange
  { id: 'badge_gamer', name: 'Mindful Gamer', description: 'Played 3 mindfulness games.', icon: Zap, color: '#3b82f6' }, // Blue
  { id: 'badge_clinical', name: 'Clinical Mind', description: 'Completed 2 health screens.', icon: Cloud, color: '#6366f1' }, // Indigo
  { id: 'badge_steady', name: 'Steady Path', description: 'Logged 10 mindfulness activities.', icon: Sun, color: '#a855f7' }, // Purple
  { id: 'badge_zen', name: 'Zen Seeker', description: 'Found balance in the Zen Stones game.', icon: Moon, color: '#78716c' }, // Stone
  { id: 'badge_master', name: 'Mindful Master', description: 'Incredible! 7 day streak.', icon: Trophy, color: '#eab308' }, // Yellow
]

export default function BadgeSystem({ badges }: BadgeSystemProps) {
  const earnedIds = new Set(badges.map(b => b.id))

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-white">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-gray-900 font-bold">Your Achievements</h3>
        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {badges.length} / {ALL_BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {ALL_BADGES.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id)
          const earnedData = badges.find(b => b.id === badge.id)
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={isEarned ? { y: -5, scale: 1.05 } : {}}
              className="flex flex-col items-center group cursor-pointer"
              title={isEarned ? `Earned on ${new Date(earnedData!.earnedAt).toLocaleDateString()}` : 'Keep going to unlock!'}
            >
              <BadgeShield 
                color={badge.color} 
                icon={badge.icon} 
                size="md" 
                isLocked={!isEarned} 
              />
              
              <div className="mt-3 text-center">
                <h4 className={`text-[10px] font-black uppercase tracking-tighter leading-tight ${isEarned ? 'text-gray-900' : 'text-gray-300'}`}>
                  {badge.name}
                </h4>
                {isEarned && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1 h-1 bg-emerald-500 rounded-full mx-auto mt-1"
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

