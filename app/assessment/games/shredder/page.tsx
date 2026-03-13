'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function WorryShredderPage() {
  const router = useRouter()
  const [worry, setWorry] = useState('')
  const [isShredding, setIsShredding] = useState(false)
  const [isShredded, setIsShredded] = useState(false)
  const [duration, setDuration] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isShredded) {
      timer = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isShredded])

  const handleShred = () => {
    if (!worry.trim() || isShredding || isShredded) return
    
    setIsShredding(true)
    
    // Simulate shredding animation delay then finish
    setTimeout(() => {
      setIsShredding(false)
      setIsShredded(true)
      finishExercise()
    }, 2000)
  }

  const finishExercise = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const gameData = {
          user_id: user.id,
          game_id: "shredder_01",
          timestamp: new Date().toISOString(),
          breaths_completed: 1, // Represents 1 worry shredded
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
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-rose-400/30 to-red-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between z-10 relative">
        <Link href="/assessment/games" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Worry Shredder</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Let it go</p>
        </div>
        <div className="w-12 h-12" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {!isShredded ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full relative z-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">What's on your mind?</h2>
              <p className="text-gray-500 text-center mb-8 font-medium px-4">
                Write down whatever is bothering you right now, then permanently shred it.
              </p>

              <div className="relative mb-8 z-20">
                <motion.div
                  animate={isShredding ? { y: 200, opacity: 0 } : { y: 0, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeIn' }}
                >
                  <textarea
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    disabled={isShredding}
                    placeholder="I am worried about..."
                    className="w-full h-48 bg-yellow-50/90 backdrop-blur-sm rounded-2xl p-6 text-xl text-gray-800 placeholder:text-gray-400 font-medium resize-none shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-400/20 disabled:bg-yellow-100 disabled:text-gray-400 shadow-yellow-200"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)',
                      lineHeight: '32px'
                    }}
                  />
                </motion.div>

                {/* The "Shredder" Overlay */}
                <div className="absolute bottom-[-10px] left-[-20px] right-[-20px] h-12 bg-white border border-gray-100 rounded-full shadow-lg z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-2 bg-gray-900 rounded-full flex gap-1 px-1 overflow-hidden" style={{ boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.4)' }}>
                    {/* Shredder teeth pattern */}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={!isShredding && worry.trim() ? { scale: 1.05 } : {}}
                whileTap={!isShredding && worry.trim() ? { scale: 0.95 } : {}}
                onClick={handleShred}
                disabled={!worry.trim() || isShredding}
                className="w-full bg-rose-500 text-white py-4 rounded-[2rem] font-bold shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:shadow-none hover:bg-rose-600 transition-all flex items-center justify-center gap-2 z-20 relative"
              >
                {isShredding ? (
                   <span className="animate-pulse">Shredding...</span>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" /> Let it Go
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white text-center z-10"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">It's Gone</h2>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                Sometimes simply writing it out and letting it go is all you need.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setWorry('')
                    setIsShredded(false)
                    setDuration(0)
                  }}
                  className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Shred Another Worry
                </button>
                <button
                  onClick={() => router.push('/assessment/games')}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  Back to Games
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paper Confetti (Simulation if shredding) */}
        <AnimatePresence>
          {isShredding && (
            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
               {Array.from({ length: 20 }).map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ y: 250, opacity: 0, x: (i - 10) * 10 }}
                   animate={{ y: [250, 400, 600], opacity: [0, 1, 0], rotate: (i % 2 === 0) ? 360 : -360 }}
                   transition={{ duration: 1.5, delay: 0.5 + Math.random() * 0.5, ease: 'linear' }}
                   className="absolute w-2 h-16 bg-yellow-100/50"
                 />
               ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
