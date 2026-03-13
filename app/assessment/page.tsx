'use client'

import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import { ClipboardList, Gamepad2 } from 'lucide-react'
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
    label: 'Stress Screen (PSS-4)',
    href: '/assessment/pss4',
    emoji: '📈',
    bg: 'bg-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-700',
    labelBg: 'bg-slate-100',
    content:
      'A brief 4-question scale designed to measure the degree to which situations in your life are appraised as stressful.',
  },
  {
    id: 4,
    label: 'Insomnia Index (ISI)',
    href: '/assessment/isi',
    emoji: '😴',
    bg: 'bg-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-700',
    labelBg: 'bg-slate-100',
    content:
      'A 7-question tool assessing the nature, severity, and impact of insomnia symptoms and sleep patterns.',
  },
  {
    id: 5,
    label: 'Wellbeing (SWEMWBS)',
    href: '/assessment/swemwbs',
    emoji: '🌱',
    bg: 'bg-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-700',
    labelBg: 'bg-slate-100',
    content:
      'A 7-item scale used to monitor mental wellbeing in the general population based on feelings and thoughts.',
  },
]

export default function AssessmentPage() {
  return (
    <div className="pb-28 min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Beamlight */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-green-400/30 to-emerald-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-10 px-6 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-slate-200 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-slate-700" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Clinical Tools</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-slate-500 text-sm mt-1">Track your symptoms over time</p>
        </div>
        
        <Link href="/assessment/games" className="w-12 h-12 bg-green-400 shadow-sm shadow-green-400/30 rounded-2xl flex items-center justify-center shrink-0 hover:bg-green-500 hover:shadow-md transition-all">
          <Gamepad2 className="w-6 h-6 text-white" />
        </Link>
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

          return card.href ? (
            <Link key={card.id} href={card.href || '#'} className="block">
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
