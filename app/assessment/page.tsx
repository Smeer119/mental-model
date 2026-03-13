'use client'

import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import { ClipboardList } from 'lucide-react'

const assessmentCards = [
  {
    id: 1,
    label: 'Problem Statement',
    emoji: '💜',
    bg: 'bg-white',
    textColor: 'text-gray-900',
    labelColor: 'text-purple-400',
    labelBg: 'bg-purple-50',
    content:
      'Many struggle with their emotions and maintaining wellness routines. Most mental health apps can feel overwhelming, complicating emotional care.',
  },
  {
    id: 2,
    label: 'Our Solution 1',
    emoji: '🔵',
    bg: 'bg-gradient-to-br from-[#714efe] to-[#9d7ffb]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'A new approach is vital for helping people grasp their emotions and maintain wellness habits. Our app offers personalized support for easier emotional care.',
  },
  {
    id: 3,
    label: 'Solution 2',
    emoji: '🟢',
    bg: 'bg-gradient-to-br from-[#4caf7d] to-[#6fcf97]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'A new approach is vital for helping people grasp their emotions and maintain wellness habits. Our app offers personalized support for easier emotional care.',
  },
  {
    id: 4,
    label: 'Your Journey',
    emoji: '✨',
    bg: 'bg-gradient-to-br from-[#f7971e] to-[#ffd200]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'Track your daily moods, identify patterns, and receive personalized insights. MentalWell adapts to your unique emotional landscape to guide your healing.',
  },
  {
    id: 5,
    label: 'This Week\'s Focus',
    emoji: '🧘',
    bg: 'bg-gradient-to-br from-[#ec4899] to-[#f97316]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'Mindful breathing and emotional check-ins are your priority this week. Small consistent actions lead to lasting change in your mental well-being.',
  },
]

export default function AssessmentPage() {
  return (
    <div className="pb-28 min-h-screen bg-[#efebf0]">
      {/* Header */}
      <div className="pt-10 px-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-purple-100 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#714efe]" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Weekly</p>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Assessment</h1>
        <p className="text-gray-500 text-sm mt-1">Understand yourself better</p>
      </div>

      {/* Cards */}
      <div className="px-6 space-y-4">
        {assessmentCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            className={`${card.bg} rounded-[2rem] p-7 shadow-sm`}
          >
            {/* Label Badge */}
            <div className={`inline-flex items-center gap-2 ${card.labelBg} rounded-full px-3 py-1.5 mb-5`}>
              <span className="text-base leading-none">{card.emoji}</span>
              <span className={`text-xs font-semibold ${card.labelColor}`}>{card.label}</span>
            </div>

            {/* Content */}
            <p className={`${card.textColor} text-[1.05rem] font-medium leading-relaxed`}>
              {card.content}
            </p>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
