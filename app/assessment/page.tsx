'use client'

import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'
import WellnessRecommendations from '@/components/WellnessRecommendations'

const assessmentCards = [
  {
    id: 1,
    label: 'Depression Screen (PHQ-9)',
    href: '/assessment/phq9',
    emoji: '🌧️',
    bg: 'bg-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-700',
    labelBg: 'bg-slate-100',
    content:
      'A clinically validated 9-question tool to measure the severity of depression symptoms over the last two weeks.',
  },
  {
    id: 2,
    label: 'Anxiety Screen (GAD-7)',
    href: '/assessment/gad7',
    emoji: '⚡',
    bg: 'bg-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-700',
    labelBg: 'bg-slate-100',
    content:
      'A clinically validated 7-question tool to measure the severity of generalized anxiety symptoms over the last two weeks.',
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
    label: "This Week's Focus",
    emoji: '🧘',
    bg: 'bg-gradient-to-br from-[#ec4899] to-[#f97316]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'Mindful breathing and emotional check-ins are your priority this week. Small consistent actions lead to lasting change in your mental well-being.',
  },
  {
    id: 6,
    label: 'Play & Feel Good',
    emoji: '🎮',
    bg: 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe]',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    labelBg: 'bg-white/20',
    content:
      'Take a break and engage in calming exercises designed to reduce stress and improve focus. Discover the power of play for your wellbeing.',
    link: '/assessment/games',
  },
]

export default function AssessmentPage() {
  return (
    <div className="pb-28 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="pt-10 px-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-slate-200 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Clinical Tools</p>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
        <p className="text-slate-500 text-sm mt-1">Track your symptoms over time</p>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8">
        <h2 className="px-6 text-lg font-bold text-gray-900 mb-4">Personalized Tips</h2>
        <WellnessRecommendations />
      </div>

      {/* Cards Header */}
      <div className="px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900">Weekly Focus</h2>
      </div>

      {/* Cards */}
      <div className="px-6 space-y-4">
        {assessmentCards.map((card, i) => {
          const CardContent = (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className={`${card.bg} rounded-[32px] p-7 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
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
          )

          return card.link || card.href ? (
            <Link key={card.id} href={card.link || card.href || '#'} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={card.id}>{CardContent}</div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
