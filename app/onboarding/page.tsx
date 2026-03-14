'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import FinnMascot from '@/components/FinnMascot'
import { ChevronRight, Heart, Zap, Sparkles } from 'lucide-react'

const steps = [
  {
    title: "Hi there, I'm Finn!",
    description: "I'm your personal companion for mental wellbeing. Let's start your journey to a calmer mind.",
    icon: <img src="/mascot.png" className="w-8 h-8 object-contain" />,
    pose: 'happy' as const,
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-[#f0f4ff]'
  },
  {
    title: "Express Yourself",
    description: "Check in with your emotions daily. We'll track your patterns and help you understand your mind better.",
    icon: <img src="/mascot.png" className="w-8 h-8 object-contain" />,
    pose: 'neutral' as const,
    color: 'from-purple-400 to-pink-600',
    bgColor: 'bg-[#fff0f6]'
  },
  {
    title: "Play to Relax",
    description: "Engage in quick, science-backed games that help reduce cortisol and bring you back to center.",
    icon: <img src="/mascot.png" className="w-8 h-8 object-contain" />,
    pose: 'thinking' as const,
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-[#f0f9ff]'
  },
  {
    title: "Build Habits",
    description: "Earn streaks, unlock rare badges, and celebrate your persistence. Mental health is a daily practice!",
    icon: <img src="/mascot.png" className="w-8 h-8 object-contain" />,
    pose: 'happy' as const,
    color: 'from-orange-400 to-rose-600',
    bgColor: 'bg-[#fff8f0]'
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/login')
    }
  }

  const step = steps[currentStep]

  return (
    <div className={`min-h-screen ${step.bgColor} transition-colors duration-1000 flex flex-col p-8 relative overflow-hidden`}>
      {/* Animated Gradient Beam */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className={`absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-br ${step.color} rounded-full blur-[100px] -z-10`}
      />

      <div className="flex-1 flex flex-col items-center justify-center pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1, x: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="flex flex-col items-center text-center"
          >
            <FinnMascot 
              pose={step.pose} 
              size={220} 
              className="mb-12 drop-shadow-2xl" 
            />

            <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-black/5 mb-6">
              {step.icon}
            </div>

            <h1 className={`text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br ${step.color} tracking-tight`}>
              {step.title}
            </h1>
            
            <p className="text-gray-500 font-bold text-lg leading-relaxed max-w-[280px]">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="pb-12 flex flex-col items-center">
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: i === currentStep ? 24 : 8,
                backgroundColor: i === currentStep ? '#1c1c1e' : '#d1d5db'
              }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full max-w-[280px] bg-gray-900 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl flex items-center justify-center gap-2 group"
        >
          {currentStep === steps.length - 1 ? "Let's Begin" : "Next Step"}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        {currentStep < steps.length - 1 && (
          <button 
            onClick={() => router.push('/login')}
            className="mt-6 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Skip Intro
          </button>
        )}
      </div>
    </div>
  )
}
