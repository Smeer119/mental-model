'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface FinnMascotProps {
  pose?: 'neutral' | 'happy' | 'wave' | 'thinking'
  size?: number
  className?: string
}

export default function FinnMascot({ pose = 'neutral', size = 200, className }: FinnMascotProps) {
  const animations = {
    neutral: {
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      scale: [1, 1.05, 1],
    },
    happy: {
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
    },
    wave: {
      rotate: [0, 10, -10, 10, 0],
      x: [0, 5, -5, 5, 0],
    },
    thinking: {
      rotateY: [0, 180, 0],
      transition: { duration: 2, repeat: Infinity }
    }
  }

  return (
    <motion.div
      animate={animations[pose]}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/mascot.png"
        alt="Finn the Mascot"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      
      {/* Dynamic Glow based on pose */}
      <motion.div
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-blue-400/20 rounded-full blur-[40px] -z-10"
      />
    </motion.div>
  )
}
