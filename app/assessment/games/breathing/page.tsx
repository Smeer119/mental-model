'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Play, X, RefreshCw, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'finished'

export default function BreathingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [breathCount, setBreathCount] = useState(0)
  const [duration, setDuration] = useState(0)
  const [timer, setTimer] = useState(4)
  const [showSummary, setShowSummary] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'finished') {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handlePhaseTransition()
            return 4
          }
          return prev - 1
        })
      }, 1000)
      timerRef.current = interval
      return () => clearInterval(interval)
    }
  }, [phase])

  useEffect(() => {
    let durationInterval: NodeJS.Timeout
    if (phase !== 'idle' && phase !== 'finished') {
      durationInterval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(durationInterval)
  }, [phase])

  const handlePhaseTransition = () => {
    setPhase((currentPhase) => {
      if (currentPhase === 'inhale') return 'hold'
      if (currentPhase === 'hold') return 'exhale'
      if (currentPhase === 'exhale') {
        setBreathCount((c) => c + 1)
        return 'inhale'
      }
      return currentPhase
    })
  }

  const startExercise = () => {
    setPhase('inhale')
    setBreathCount(0)
    setDuration(0)
    setTimer(4)
    startTimeRef.current = Date.now()
  }

  const finishExercise = async () => {
    const finalDuration = duration
    const finalBreaths = breathCount
    setPhase('finished')
    setShowSummary(true)

    // Save data to Supabase (Mocking table insert for now as we don't know the exact schema of the database)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const gameData = {
          user_id: user.id,
          game_id: "breathing_01",
          timestamp: new Error().stack ? new Date().toISOString() : new Date().toISOString(),
          breaths_completed: finalBreaths,
          duration_seconds: finalDuration,
        }
        
        // We'll try to insert to a 'game_logs' table. If it fails, we'll log it.
        // In a real scenario, this table should be created in Supabase.
        const { error } = await supabase.from('game_logs').insert(gameData)
        if (error) console.warn('Failed to save game data:', error.message)
      }
    } catch (e) {
      console.error('Error saving game data:', e)
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inhale'
      case 'hold': return 'Hold'
      case 'exhale': return 'Exhale'
      default: return 'Ready?'
    }
  }

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Fill your lungs with air...'
      case 'hold': return 'Keep the stillness...'
      case 'exhale': return 'Release all tension...'
      default: return 'Tap start to begin your session'
    }
  }

  return (
    <div className="min-h-screen bg-[#efebf0] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between">
        <Link href="/assessment/games" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Mindful Breathing</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">4-4-4 Technique</p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Animation Circle */}
              <div className="relative w-72 h-72 flex items-center justify-center mb-16">
                {/* Background pulse */}
                <motion.div
                  animate={{
                    scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                    opacity: phase === 'idle' ? 0.1 : 0.2,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute inset-0 bg-blue-400 rounded-full blur-3xl"
                />
                
                {/* Main Circle */}
                <motion.div
                  animate={{
                    scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-2xl flex flex-col items-center justify-center text-white relative z-10 border-4 border-white/30"
                >
                  <span className="text-4xl font-bold">{phase === 'idle' ? '🌬️' : timer}</span>
                  <span className="text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">
                    {phase === 'idle' ? '' : 'Seconds'}
                  </span>
                </motion.div>

                {/* Outer Ring */}
                <motion.div
                  animate={{
                    scale: phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute w-56 h-56 rounded-full border border-blue-200/50"
                />
              </div>

              {/* Instructions */}
              <div className="text-center mb-12 h-20">
                <motion.h2 
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  {getPhaseText()}
                </motion.h2>
                <motion.p 
                  key={`instr-${phase}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 font-medium"
                >
                  {getPhaseInstruction()}
                </motion.p>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 mb-12">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-white">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Breaths</p>
                  <p className="text-xl font-bold text-gray-900">{breathCount}</p>
                </div>
                <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-white">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                {phase === 'idle' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startExercise}
                    className="bg-[#714efe] text-white px-10 py-4 rounded-3xl font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Start Session
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={finishExercise}
                      className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-3xl font-bold shadow-sm flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Finish
                    </motion.button>
                  </>
                )}
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
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Well Done!</h2>
              <p className="text-gray-500 mb-8 font-medium">You've successfully completed your breathing session.</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{breathCount}</p>
                  <p className="text-[10px] text-gray-500">Breaths</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{duration}s</p>
                  <p className="text-[10px] text-gray-500">Seconds</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setPhase('idle');
                  }}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-[#714efe] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-[#5d3fd3] transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm font-medium">Breathe in. Breathe out. Find your center.</p>
      </div>
    </div>
  )
}
