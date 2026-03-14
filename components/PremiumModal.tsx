'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Zap } from 'lucide-react'

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-500 mb-8">
              We're currently perfecting our premium features. Stay tuned for advanced analytics and exclusive wellness tools!
            </p>

            <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 flex flex-col items-center gap-4">
               <Zap className="w-12 h-12 text-purple-600 fill-purple-600 animate-pulse" />
               <p className="text-purple-900 font-bold">Premium Journey starts here...</p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-[#714efe] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:bg-[#5f3ddb] transition-all"
            >
              Got it!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
