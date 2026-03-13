'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, RefreshCw, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const STONES = [
  { w: "w-40", h: "h-14", color: "bg-stone-600", border: 'border-stone-400', mass: 1 },
  { w: "w-32", h: "h-12", color: "bg-stone-500", border: 'border-stone-300', mass: 0.9 },
  { w: "w-28", h: "h-10", color: "bg-zinc-600", border: 'border-zinc-400', mass: 0.8 },
  { w: "w-20", h: "h-8", color: "bg-neutral-500", border: 'border-neutral-300', mass: 0.7 },
  { w: "w-12", h: "h-6", color: "bg-gray-400", border: 'border-gray-200', mass: 0.6 },
]

export default function ZenStonesPage() {
  const router = useRouter()
  const [stackedCount, setStackedCount] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isStarted && !showSummary) {
      timer = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isStarted, showSummary])

  const handleStack = () => {
    if (!isStarted) setIsStarted(true)
    
    if (stackedCount < STONES.length) {
      setStackedCount(s => s + 1)
      if (stackedCount + 1 === STONES.length) {
        setTimeout(() => finishExercise(), 1500)
      }
    }
  }

  const resetStack = () => {
    setStackedCount(0)
    setDuration(0)
    setShowSummary(false)
    setIsStarted(false)
  }

  const finishExercise = async () => {
    setShowSummary(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const gameData = {
          user_id: user.id,
          game_id: "stones_01",
          timestamp: new Date().toISOString(),
          breaths_completed: STONES.length,
          duration_seconds: duration,
        }
        await supabase.from('game_logs').insert(gameData)
      }
    } catch (e) {
      console.error('Error saving game data:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#efebf0] flex flex-col font-sans overflow-hidden relative">
      {/* Background Beamlight */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-stone-400/30 to-white/20 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between z-10 relative">
        <Link href="/assessment/games" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Zen Stones</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Find Balance</p>
        </div>
        <div className="w-12 h-12" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex flex-col justify-end pb-24 items-center max-w-sm mx-auto"
            >
              {/* Instructions top */}
              <div className="absolute top-1/4 left-0 right-0 text-center pointer-events-none">
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Build your Cairn</h2>
                 <p className="text-gray-500 font-medium">Take a slow breath, then place a stone.</p>
              </div>

              {/* Stack Area */}
              <div className="relative w-full h-[300px] flex flex-col-reverse items-center justify-start pointer-events-none z-10">
                {/* The ground line */}
                <div className="absolute bottom-0 w-64 h-1 bg-stone-300 rounded-full blur-[1px] shadow-sm pointer-events-none" />
                <div className="absolute bottom-[-16px] w-[500px] h-32 bg-stone-200/50 rounded-full blur-[30px] pointer-events-none -z-10" />

                {STONES.slice(0, stackedCount).reverse().map((stone, i) => (
                  <motion.div
                    key={`stone-${i}`}
                    initial={{ y: -300, rotate: (Math.random() - 0.5) * 20, opacity: 0 }}
                    animate={{ y: 0, rotate: (Math.random() - 0.5) * 4, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, mass: stone.mass }}
                    style={{ zIndex: STONES.length - i }}
                    className={`${stone.w} ${stone.h} ${stone.color} rounded-[100px] mb-[-8px] shadow-lg border-t-2 border-l-2 ${stone.border} relative overflow-hidden`}
                  >
                    {/* Highlight for volume */}
                    <div className="absolute top-1 left-2 right-2 h-[30%] bg-white/10 rounded-full mix-blend-overlay"></div>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={stackedCount < STONES.length ? { scale: 1.05 } : {}}
                whileTap={stackedCount < STONES.length ? { scale: 0.95 } : {}}
                onClick={handleStack}
                disabled={stackedCount >= STONES.length}
                className="mt-16 w-full max-w-[280px] bg-[#714efe] text-white py-4 rounded-[2.5rem] font-bold shadow-xl shadow-purple-500/30 disabled:opacity-50 transition-all z-20"
              >
                {stackedCount < STONES.length ? 'Place Stone' : 'Balanced...'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white text-center z-10 max-w-sm mx-auto"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-stone-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfect Balance</h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                You found your center. Take this calmness through the rest of your day.
              </p>

              <div className="space-y-4">
                <button
                  onClick={resetStack}
                  className="w-full bg-stone-50 text-stone-900 py-4 rounded-2xl font-bold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Build Again
                </button>
                <button
                  onClick={() => router.push('/assessment/games')}
                  className="w-full bg-stone-600 text-white py-4 rounded-2xl font-bold border-2 border-stone-600 hover:bg-stone-700 hover:border-stone-700 shadow-xl shadow-stone-500/20 transition-colors flex items-center justify-center gap-2"
                >
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
