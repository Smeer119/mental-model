'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveMood } from '@/app/actions/mood'
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react'

const moods = [
  { name: 'Happy',       emoji: '😊', color: '#f5a623', bg: 'bg-[#fff3d6]' },
  { name: 'Sad',         emoji: '😔', color: '#72b8f0', bg: 'bg-[#ddf0ff]' },
  { name: 'Angry',       emoji: '😠', color: '#e84393', bg: 'bg-[#ffe0ef]' },
  { name: 'Tired',       emoji: '😑', color: '#b5a090', bg: 'bg-[#f0e8e2]' },
  { name: 'Frustrated',  emoji: '😤', color: '#9b7ecb', bg: 'bg-[#ede0ff]' },
]

const MAX_CHARS = 200

interface MoodSelectorProps {
  lastMood?: string | null
}

export default function MoodSelector({ lastMood }: MoodSelectorProps) {
  const [selected, setSelected]       = useState<string | null>(lastMood ?? null)
  const [showModal, setShowModal]     = useState(false)
  const [pendingMood, setPendingMood] = useState<string | null>(null)
  const [reason, setReason]           = useState('')
  const [status, setStatus]           = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)

  const moodConfig = moods.find(m => m.name === pendingMood)

  const handleSelect = (mood: string) => {
    setPendingMood(mood)
    setReason('')
    setStatus('idle')
    setErrorMsg(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!pendingMood) return
    setStatus('saving')
    setErrorMsg(null)
    try {
      const result = await saveMood(pendingMood, reason.trim())
      if (result?.error) {
        setStatus('error')
        setErrorMsg(result.error)
      } else {
        setStatus('success')
        setSelected(pendingMood)
        setTimeout(() => setShowModal(false), 1000)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  const handleClose = () => {
    if (status === 'saving') return   // don't close while saving
    setShowModal(false)
    setStatus('idle')
  }

  return (
    <>
      {/* ─── Mood Chips ─── */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center">
            {moods.map((mood) => {
              const isActive = selected === mood.name
              return (
                <motion.button
                  key={mood.name}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleSelect(mood.name)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    animate={isActive ? { scale: 1.18 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${isActive ? mood.bg : 'bg-gray-50'}
                      ${isActive ? 'ring-2 ring-offset-1' : ''}`}
                    style={isActive ? { '--tw-ring-color': mood.color } as React.CSSProperties : {}}
                  >
                    {mood.emoji}
                  </motion.div>
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {mood.name}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {selected && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 text-center font-medium"
            >
              You're feeling <span className="font-bold text-gray-600">{selected}</span> today
            </motion.p>
          )}
        </div>
      </div>

      {/* ─── Bottom Sheet Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Sheet — fixed height so button never hides */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 380 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-[2.5rem] z-[101] flex flex-col"
              style={{ maxHeight: '70vh' }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-5 flex-shrink-0" />

              {/* Scrollable content area */}
              <div className="overflow-y-auto px-6 flex-1">
                {/* Mood header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${moodConfig?.bg ?? 'bg-gray-100'}`}>
                    {moodConfig?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">You selected</p>
                    <h2 className="text-xl font-bold text-gray-900">{pendingMood}</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={status === 'saving'}
                    className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Question */}
                <p className="text-gray-800 font-semibold mb-3 text-[15px]">
                  Why are you feeling{' '}
                  <span style={{ color: moodConfig?.color }}>{pendingMood}</span>?{' '}
                  <span className="text-gray-400 font-normal text-sm">(optional)</span>
                </p>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={reason}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) setReason(e.target.value)
                    }}
                    placeholder="Tell me what's on your mind..."
                    rows={3}
                    disabled={status === 'saving' || status === 'success'}
                    className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none outline-none border border-gray-100 focus:border-[#714efe] transition-colors disabled:opacity-60"
                  />
                  <span className={`absolute bottom-3 right-3 text-[11px] font-medium ${reason.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-300'}`}>
                    {MAX_CHARS - reason.length}
                  </span>
                </div>

                {/* Error notice */}
                <AnimatePresence>
                  {status === 'error' && errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-2xl px-4 py-2.5"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Save button — always visible at the bottom */}
              <div className="px-6 pb-10 pt-4 flex-shrink-0 border-t border-gray-50 bg-white">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={status === 'saving' || status === 'success'}
                  className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all
                    ${status === 'success'
                      ? 'bg-green-400'
                      : status === 'error'
                      ? 'bg-red-400 hover:bg-red-500'
                      : 'bg-[#714efe] hover:bg-[#5d3fd3] shadow-lg shadow-purple-500/30'}
                    disabled:cursor-not-allowed`}
                >
                  {status === 'saving' && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {status === 'success' && (
                    <><CheckCircle2 className="w-5 h-5" /> Saved!</>
                  )}
                  {status === 'error' && (
                    <><AlertCircle className="w-5 h-5" /> Try Again</>
                  )}
                  {status === 'idle' && (
                    <><Send className="w-4 h-4" /> Save Mood</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
