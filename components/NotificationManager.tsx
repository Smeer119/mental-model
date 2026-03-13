'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Bell, X, Info, Trophy, Flame, Play } from 'lucide-react'

type AppNotification = {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'badge' | 'streak' | 'game'
  is_read: boolean
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [active, setActive] = useState<AppNotification | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitial = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      
      if (data) setNotifications(data as AppNotification[])
    }

    fetchInitial()

    // 2. Real-time Subscription
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as AppNotification
          setNotifications(prev => [newNotif, ...prev])
          setActive(newNotif)
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setActive(null)
          }, 5000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const icons = {
    info: <Info className="text-blue-500" />,
    success: <Info className="text-emerald-500" />,
    badge: <Trophy className="text-amber-500" />,
    streak: <Flame className="text-orange-500" />,
    game: <Play className="text-purple-500" />
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[200] w-[calc(100%-48px)] max-w-sm"
          >
            <div className="bg-white rounded-3xl p-5 shadow-2xl border border-white flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90">
                {icons[active.type] || <Bell className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">{active.title}</h4>
                <p className="text-[13px] text-gray-500 font-bold leading-tight line-clamp-2">{active.message}</p>
              </div>
              <button 
                onClick={() => setActive(null)}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {/* Progress bar for timer */}
            <motion.div 
               initial={{ scaleX: 1 }}
               animate={{ scaleX: 0 }}
               transition={{ duration: 5, ease: "linear" }}
               className="absolute bottom-0 left-6 right-6 h-1 bg-gray-100/50 rounded-full origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
