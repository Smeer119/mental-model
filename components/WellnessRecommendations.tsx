'use client'

import { motion } from 'framer-motion'
import { Droplets, Wind, Footprints, Moon, Sun, Heart } from 'lucide-react'
import Link from 'next/link'

const recommendations = [
  {
    id: 1,
    title: 'Mindful Breathing',
    description: 'Take 5 deep breaths to center yourself.',
    icon: <Wind className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    link: '/assessment/games/breathing',
  },
  {
    id: 2,
    title: 'Hydration Break',
    description: 'Drink a glass of water to refresh your mind.',
    icon: <Droplets className="w-5 h-5" />,
    color: 'bg-cyan-100 text-cyan-600',
    bgGradient: 'from-cyan-50 to-cyan-100',
    link: '/journal',
  },
  {
    id: 3,
    title: 'Nature Walk',
    description: 'A 5-minute walk outside can boost your mood.',
    icon: <Footprints className="w-5 h-5" />,
    color: 'bg-green-100 text-green-600',
    bgGradient: 'from-green-50 to-green-100',
    link: '/journal',
  },
  {
    id: 4,
    title: 'Digital Detox',
    description: 'Turn off screens for 15 minutes to reset.',
    icon: <Moon className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    link: '/journal',
  },
  {
    id: 5,
    title: 'Sunlight Exposure',
    description: 'Get some fresh air and natural vitamin D.',
    icon: <Sun className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    link: '/journal',
  },
  {
    id: 6,
    title: 'Self-Kindness',
    description: 'Acknowledge one thing you did well today.',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-rose-100 text-rose-600',
    bgGradient: 'from-rose-50 to-rose-100',
    link: '/chat',
  },
]

export default function WellnessRecommendations() {
  return (
    <div className="w-full">
      <div className="flex overflow-x-auto pb-4 px-6 gap-4 no-scrollbar items-stretch">
        {recommendations.map((item, index) => (
          <Link key={item.id} href={item.link} className="flex-shrink-0 w-64 flex">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
              className={`flex-1 w-full p-5 rounded-[2rem] bg-gradient-to-br ${item.bgGradient} shadow-sm border border-white/50 active:shadow-inner transition-shadow flex flex-col`}
            >
              <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-gray-900 font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed flex-1">{item.description}</p>
              
              {item.link === '#' && (
                <div className="mt-3 inline-flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  Coming Soon
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
