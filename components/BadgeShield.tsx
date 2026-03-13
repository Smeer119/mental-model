'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface BadgeShieldProps {
  color: string
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  isLocked?: boolean
}

export default function BadgeShield({ color, icon: Icon, size = 'md', isLocked = false }: BadgeShieldProps) {
  const sizes = {
    sm: 'w-12 h-14',
    md: 'w-20 h-24',
    lg: 'w-32 h-36'
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      {/* The Shield Shape using SVG for precision */}
      <svg 
        viewBox="0 0 100 120" 
        className={`absolute inset-0 w-full h-full drop-shadow-md ${isLocked ? 'text-gray-200' : 'text-current'}`}
        style={{ color: isLocked ? '#e5e7eb' : color }}
      >
        <path
          d="M50 0 L95 15 C95 15 100 80 50 120 C0 80 5 15 5 15 L50 0 Z"
          fill="currentColor"
        />
        {/* Subtle Highlight */}
        {!isLocked && (
          <path
            d="M50 5 L90 18 C90 18 93 40 75 40 C57 40 50 20 50 5 Z"
            fill="white"
            fillOpacity="0.2"
          />
        )}
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {isLocked ? (
          <div className="w-1.5 h-4 bg-gray-400 rounded-full opacity-30" />
        ) : (
          <Icon className={`${iconSizes[size]} text-white drop-shadow-sm`} strokeWidth={2.5} />
        )}
      </div>
    </div>
  )
}
