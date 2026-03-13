'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Sun, Droplets, Wind, Moon, Footprints, Heart, Camera, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TAGS = [
  { id: 'sunlight', label: 'Sunlight', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100', activeBg: 'bg-orange-500', activeText: 'text-white' },
  { id: 'water', label: 'Hydration', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-100', activeBg: 'bg-cyan-500', activeText: 'text-white' },
  { id: 'walk', label: 'Walk', icon: Footprints, color: 'text-green-500', bg: 'bg-green-100', activeBg: 'bg-green-500', activeText: 'text-white' },
  { id: 'breathe', label: 'Breathing', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-100', activeBg: 'bg-blue-500', activeText: 'text-white' },
  { id: 'rest', label: 'Rest', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-100', activeBg: 'bg-purple-500', activeText: 'text-white' },
  { id: 'kindness', label: 'Kindness', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100', activeBg: 'bg-rose-500', activeText: 'text-white' },
]

export default function JournalPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!content.trim() && selectedTags.length === 0) return
    
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => {
        router.push('/assessment')
      }, 1500)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#efebf0] pb-24">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 sticky top-0 z-10 bg-[#efebf0]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <Link href="/assessment">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </div>
          </Link>
          <p className="text-gray-500 font-medium">New Entry</p>
          <div className="w-10" /> {/* Spacer */}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">How are you feeling?</h1>
        <p className="text-gray-500 text-sm mt-1">Record your thoughts and activities</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Editor Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-6 shadow-sm border border-white/50"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Today I felt..."
            className="w-full h-40 bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 text-lg leading-relaxed"
          />
          
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <button className="p-2 text-gray-400 hover:text-[#714efe] transition-colors rounded-full hover:bg-purple-50">
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#714efe] transition-colors rounded-full hover:bg-purple-50">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Activities / Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-gray-900 mb-4 px-2 uppercase tracking-wide">Activities to log</h2>
          <div className="flex flex-wrap gap-3">
            {TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id)
              const Icon = tag.icon
              return (
                <motion.button
                  key={tag.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isSelected 
                      ? `${tag.activeBg} ${tag.activeText} shadow-md` 
                      : `bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-gray-200`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tag.color}`} />
                  {tag.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-6"
        >
          <button
            onClick={handleSave}
            disabled={(!content.trim() && selectedTags.length === 0) || isSaving || saved}
            className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : (!content.trim() && selectedTags.length === 0)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#714efe] text-white shadow-[0_8px_20px_rgba(113,78,254,0.3)] hover:shadow-[0_12px_25px_rgba(113,78,254,0.4)] hover:-translate-y-1'
            }`}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.div key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Saved Entry
                </motion.div>
              ) : isSaving ? (
                <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Saving...
                </motion.div>
              ) : (
                <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Save Journal Entry
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
