import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, Wind, Gamepad2, Lock } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/utils/supabase/client'
import PremiumModal from '@/components/PremiumModal'

const allGames = [
  {
    id: 'breathing',
    title: 'Mindful Breathing',
    description: 'A rhythmic breathing exercise to calm your mind and body.',
    emoji: '🌬️',
    icon: Wind,
    color: 'from-blue-400 to-cyan-400',
    link: '/assessment/games/breathing',
    isPremium: false,
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'A sensory technique to bring you back to the present moment.',
    emoji: '🧘',
    icon: Gamepad2,
    color: 'from-purple-400 to-pink-400',
    link: '/assessment/games/grounding',
    isPremium: false,
  },
  {
    id: 'bubble',
    title: 'Bubble Wrap Pop',
    description: 'Soothing digital bubble wrap logic to melt your stress away.',
    emoji: '🫧',
    icon: Gamepad2,
    color: 'from-sky-300 to-indigo-300',
    link: '/assessment/games/bubble',
    isPremium: true,
  },
  {
    id: 'shredder',
    title: 'Worry Shredder',
    description: 'Type down your anxieties and visually destroy them.',
    emoji: '📄',
    icon: Gamepad2,
    color: 'from-rose-400 to-red-400',
    link: '/assessment/games/shredder',
    isPremium: true,
  },
  {
    id: 'stones',
    title: 'Zen Stones',
    description: 'Carefully stack digital stones to find balance and focus.',
    emoji: '🪨',
    icon: Gamepad2,
    color: 'from-stone-400 to-stone-600',
    link: '/assessment/games/stones',
    isPremium: true,
  },
]

export default function GamesPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkPremium() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.is_premium) {
        setIsPremium(true)
      }
    }
    checkPremium()
  }, [])

  return (
    <div className="pb-28 min-h-screen bg-[#efebf0] relative overflow-hidden">
      {/* Background Beamlight */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/30 to-purple-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="pt-10 px-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/assessment" className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Mini Games</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Relax & Play</h1>
        <p className="text-gray-500 text-sm mt-1">Short activities for your wellbeing</p>
      </div>

      {/* Games List */}
      <div className="px-6 space-y-4">
        {allGames.map((game, i) => {
          const locked = game.isPremium && !isPremium
          
          const content = (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`bg-white rounded-[2rem] p-6 shadow-sm border border-white hover:shadow-md transition-all group relative overflow-hidden ${locked ? 'opacity-80 cursor-pointer' : ''}`}
              onClick={locked ? () => setIsModalOpen(true) : undefined}
            >
              {locked && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-purple-600" />
                </div>
              )}
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/10 ${locked ? 'grayscale-[0.5]' : ''}`}>
                  {game.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-500 transition-colors">
                    {game.title}
                    {game.isPremium && <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-black align-middle">PRO</span>}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{game.description}</p>
                </div>
              </div>
            </motion.div>
          )

          if (locked) return <div key={game.id}>{content}</div>
          return <Link key={game.id} href={game.link} className="block mb-4">{content}</Link>
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 text-center"
        >
          <p className="text-blue-400 font-medium text-sm">More calming activities coming soon!</p>
        </motion.div>
      </div>

      <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <BottomNav />
    </div>
  )
}
