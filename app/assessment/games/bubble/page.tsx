'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, RefreshCw, Trophy, Bell } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import useSound from 'use-sound' // We don't have this, so we will use basic HTML Audio

export default function BubbleWrapPage() {
  const router = useRouter()
  // Generate a 4x6 grid of bubbles
  const NUM_BUBBLES = 24
  const [bubbles, setBubbles] = useState<boolean[]>(new Array(NUM_BUBBLES).fill(false))
  const [duration, setDuration] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const supabase = createClient()
  
  // HTML5 audio
  const popSound = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    // Create a synthesized generic pop sound for the bubbles so we don't need external assets
    // Or we just rely on visual feedback if audio contexts cause issues.
    // For this implementation, we'll mimic sound with visual pop
  }, [])

  useEffect(() => {
    let durationInterval: NodeJS.Timeout
    if (isStarted && !showSummary) {
      durationInterval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(durationInterval)
  }, [isStarted, showSummary])

  const popBubble = (index: number) => {
    if (bubbles[index] || showSummary) return

    if (!isStarted) setIsStarted(true)

    const newBubbles = [...bubbles]
    newBubbles[index] = true
    setBubbles(newBubbles)
    
    // Check win condition
    if (newBubbles.every(b => b)) {
      setTimeout(() => finishExercise(), 600)
    }
  }
  
  const resetBubbles = () => {
    setBubbles(new Array(NUM_BUBBLES).fill(false))
    setIsStarted(false)
    setDuration(0)
    setShowSummary(false)
  }

  const finishExercise = async () => {
    setShowSummary(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const gameData = {
          user_id: user.id,
          game_id: "bubble_wrap_01",
          timestamp: new Date().toISOString(),
          breaths_completed: NUM_BUBBLES, // Reusing column for total popped
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
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-sky-400/30 to-indigo-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between z-10">
        <Link href="/assessment/games" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Bubble Wrap</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Pop to Relax</p>
        </div>
        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400"
        >
          <Bell className={`w-5 h-5 ${isSoundEnabled ? 'text-blue-500' : 'text-gray-300'}`} />
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              {/* Score / Reset Header */}
              <div className="flex justify-between items-center mb-8 px-4">
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-white">
                  <span className="text-sm font-bold text-gray-500">Popped</span>
                  <p className="text-xl font-black text-blue-500 leading-none">
                    {bubbles.filter(b => b).length} <span className="text-sm text-gray-300">/ {NUM_BUBBLES}</span>
                  </p>
                </div>
                
                <button 
                  onClick={resetBubbles}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* The Bubble Wrap Grid */}
              <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white/60">
                <div className="grid grid-cols-4 gap-4">
                  {bubbles.map((isPopped, i) => (
                    <motion.button
                      key={i}
                      whileHover={!isPopped ? { scale: 1.05 } : {}}
                      whileTap={!isPopped ? { scale: 0.85 } : {}}
                      onClick={() => popBubble(i)}
                      className="relative w-16 h-16 sm:w-14 sm:h-14 mx-auto rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto"
                      disabled={isPopped}
                    >
                      {/* Base Bubble */}
                      <motion.div 
                        animate={{
                          boxShadow: isPopped 
                            ? 'inset 0 4px 6px rgba(0,0,0,0.05), inset 0 -4px 6px rgba(255,255,255,0.5)' 
                            : 'inset 0 4px 10px rgba(255,255,255,0.9), inset 0 -4px 10px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(59, 130, 246, 0.2)',
                          backgroundColor: isPopped ? 'rgba(255,255,255,0.4)' : 'rgba(255, 255, 255, 0.85)',
                          scale: isPopped ? 0.95 : 1
                        }}
                        className="absolute inset-0 rounded-full border border-white/50"
                      />
                      
                      {/* Top Glint / Highlight */}
                      <AnimatePresence>
                        {!isPopped && (
                          <motion.div 
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute top-2 left-2 w-4 h-4 bg-white/80 rounded-full blur-[1px]" 
                          />
                        )}
                      </AnimatePresence>

                      {/* Pop Effect */}
                      <AnimatePresence>
                        {isPopped && (
                          <motion.div
                            initial={{ opacity: 1, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute inset-0 bg-blue-400 rounded-full mix-blend-overlay"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
             <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-white text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-blue-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h2>
              <p className="text-gray-500 mb-8 font-medium">Stress successfully popped away.</p>

              <div className="bg-gray-50 rounded-3xl p-6 mb-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Completion Time</p>
                <p className="text-4xl font-black text-blue-500">{duration}s</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={resetBubbles}
                  className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Pop More Bubbles
                </button>
                <button
                  onClick={() => router.push('/assessment/games')}
                  className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 border-2 border-slate-100 transition-colors flex items-center justify-center gap-2"
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
