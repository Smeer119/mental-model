'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Play, X, RefreshCw, CheckCircle2, Eye, Hand, Ear, Wind, Coffee } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const PHASES = [
  { id: 'see', count: 5, label: 'Things you can SEE', instruction: 'Look around you. Notice 5 things you can see.', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100', activeBg: 'bg-blue-500', activeText: 'text-white', shadow: 'shadow-blue-500/30' },
  { id: 'feel', count: 4, label: 'Things you can FEEL', instruction: 'Pay attention to your body. Notice 4 things you can feel.', icon: Hand, color: 'text-emerald-500', bg: 'bg-emerald-100', activeBg: 'bg-emerald-500', activeText: 'text-white', shadow: 'shadow-emerald-500/30' },
  { id: 'hear', count: 3, label: 'Things you can HEAR', instruction: 'Listen closely. Notice 3 things you can hear.', icon: Ear, color: 'text-purple-500', bg: 'bg-purple-100', activeBg: 'bg-purple-500', activeText: 'text-white', shadow: 'shadow-purple-500/30' },
  { id: 'smell', count: 2, label: 'Things you can SMELL', instruction: 'Take a soft breath in. Notice 2 things you can smell.', icon: Wind, color: 'text-amber-500', bg: 'bg-amber-100', activeBg: 'bg-amber-500', activeText: 'text-white', shadow: 'shadow-amber-500/30' },
  { id: 'taste', count: 1, label: 'Thing you can TASTE', instruction: 'Focus on your mouth. Notice 1 thing you can taste.', icon: Coffee, color: 'text-rose-500', bg: 'bg-rose-100', activeBg: 'bg-rose-500', activeText: 'text-white', shadow: 'shadow-rose-500/30' },
]

export default function GroundingPage() {
  const router = useRouter()
  const [isStarted, setIsStarted] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [clickedItems, setClickedItems] = useState<boolean[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [duration, setDuration] = useState(0)
  
  const startTimeRef = useRef<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let durationInterval: NodeJS.Timeout
    if (isStarted && !showSummary) {
      durationInterval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(durationInterval)
  }, [isStarted, showSummary])

  useEffect(() => {
    if (isStarted && phaseIndex < PHASES.length) {
      setClickedItems(new Array(PHASES[phaseIndex].count).fill(false))
    }
  }, [isStarted, phaseIndex])

  const handleItemClick = (index: number) => {
    if (clickedItems[index]) return
    
    const newItems = [...clickedItems]
    newItems[index] = true
    setClickedItems(newItems)

    // Check if phase is complete
    if (newItems.every((item) => item)) {
      setTimeout(() => {
        if (phaseIndex + 1 < PHASES.length) {
          setPhaseIndex((prev) => prev + 1)
        } else {
          finishExercise()
        }
      }, 800)
    }
  }

  const startExercise = () => {
    setIsStarted(true)
    setPhaseIndex(0)
    setDuration(0)
    setShowSummary(false)
    startTimeRef.current = Date.now()
  }

  const finishExercise = async () => {
    setShowSummary(true)
    const finalDuration = duration

    // Save data to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const gameData = {
          user_id: user.id,
          game_id: "grounding_01",
          timestamp: new Date().toISOString(),
          // Storing arbitrary score in breaths_completed for now to keep schema compatible
          breaths_completed: 15, // 5+4+3+2+1
          duration_seconds: finalDuration,
        }
        
        const { error } = await supabase.from('game_logs').insert(gameData)
        if (error) console.warn('Failed to save game data:', error.message)
      }
    } catch (e) {
      console.error('Error saving game data:', e)
    }
  }

  const currentPhase = PHASES[phaseIndex]

  return (
    <div className="min-h-screen bg-[#efebf0] flex flex-col font-sans overflow-hidden relative">
      {/* Background Beamlight */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/30 to-pink-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between">
        <Link href="/assessment/games" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">5-4-3-2-1 Grounding</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Sensory Focus</p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg shadow-purple-500/10 mb-8">
                <span className="text-6xl">🧘</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ground Yourself</h2>
              <p className="text-gray-500 font-medium mb-12 max-w-[280px]">
                Connect with the present moment by mindfully engaging your 5 senses. Take your time.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startExercise}
                className="bg-[#714efe] text-white px-10 py-4 rounded-3xl font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Begin Practice
              </motion.button>
            </motion.div>
          ) : !showSummary ? (
            <motion.div
              key={`phase-${phaseIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full h-full flex flex-col items-center"
            >
              <div className="flex-1 flex flex-col justify-center w-full max-w-sm">
                {/* Instruction */}
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`inline-flex items-center justify-center w-20 h-20 ${currentPhase.bg} rounded-[2rem] mb-6`}
                  >
                    <currentPhase.icon className={`w-10 h-10 ${currentPhase.color}`} />
                  </motion.div>
                  <motion.h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                    {currentPhase.count}
                  </motion.h2>
                  <motion.h3 className="text-xl font-bold text-gray-700 mb-2">
                    {currentPhase.label}
                  </motion.h3>
                  <p className="text-gray-500 font-medium text-sm px-4">
                    {currentPhase.instruction}
                  </p>
                </div>

                {/* Interaction Items */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {clickedItems.map((isClicked, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleItemClick(i)}
                      className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-300 border-4 border-white shadow-sm
                        ${isClicked 
                          ? `${currentPhase.activeBg} ${currentPhase.activeText} shadow-lg ${currentPhase.shadow}` 
                          : 'bg-white text-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {isClicked ? <CheckCircle2 className="w-8 h-8" /> : <currentPhase.icon className="w-8 h-8 opacity-50" />}
                    </motion.button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Tap to acknowledge
                  </p>
                </div>
              </div>

              {/* Quit Button */}
              <div className="pb-8">
                <button
                  onClick={finishExercise}
                  className="bg-white/80 text-gray-500 px-6 py-3 rounded-2xl font-semibold shadow-sm text-sm hover:text-gray-900 transition-colors"
                >
                  End Early
                </button>
              </div>
            </motion.div>
          ) : (
             <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Beautifully Done</h2>
              <p className="text-gray-500 mb-8 font-medium">You are now grounded and present.</p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-10">
                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Calmness Time</p>
                <p className="text-3xl font-bold text-gray-900">{duration}s</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setIsStarted(false);
                  }}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Practice Again
                </button>
                <button
                  onClick={() => router.push('/assessment/games')}
                  className="w-full bg-[#714efe] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-[#5d3fd3] transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Games
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
