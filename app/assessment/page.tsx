'use client'

import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import { ClipboardList } from 'lucide-react'

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
]

import Link from 'next/link'

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

      {/* Cards */}
      <div className="px-6 space-y-4">
        {assessmentCards.map((card, i) => (
          <Link href={card.href} key={card.id} className="block">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className={`${card.bg} rounded-[2rem] p-7 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors`}
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
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
