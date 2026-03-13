'use client'

import { useEffect, useState } from 'react'
import { Gamepad2, Hourglass, Wind } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface GameLog {
  breaths_completed: number
  duration_seconds: number
}

export default function GamesActivity() {
  const [stats, setStats] = useState({ breaths: 0, time: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('game_logs')
            .select('breaths_completed, duration_seconds')
            .eq('user_id', user.id)

          if (data && !error) {
            const totals = data.reduce(
              (acc, curr) => ({
                breaths: acc.breaths + (curr.breaths_completed || 0),
                time: acc.time + (curr.duration_seconds || 0),
              }),
              { breaths: 0, time: 0 }
            )
            setStats(totals)
          }
        }
      } catch (e) {
        console.error('Failed to fetch game stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-gray-900 font-bold">Games Activity</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-col items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Wind className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.breaths}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Total Breaths</p>
        </div>

        <div className="bg-cyan-50/50 rounded-2xl p-4 flex flex-col items-center">
          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
            <Hourglass className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(stats.time / 60)}</p>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Mins Played</p>
        </div>
      </div>
    </div>
  )
}
