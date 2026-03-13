import { createClient } from './supabase/server'

export type UserStats = {
  weeklyCheckIns: number
  topEmotions: { name: string; percentage: string; color: string; emoji: string }[]
  trendData: { day: string; level: number; label: string; highlight: boolean }[]
  weeklyTrendPercentage: string
}

const moodConfig: Record<string, { level: number; color: string; emoji: string }> = {
  Happy: { level: 5, color: 'bg-[#fff3d6]', emoji: '😊' },
  Excited: { level: 5, color: 'bg-[#fff3d6]', emoji: '😊' }, // Fallback alias
  Calm: { level: 4, color: 'bg-[#ddf0ff]', emoji: '😌' },
  Neutral: { level: 3, color: 'bg-[#f0e8e2]', emoji: '😐' },
  Tired: { level: 2, color: 'bg-[#f0e8e2]', emoji: '😑' },
  Sad: { level: 2, color: 'bg-[#ddf0ff]', emoji: '😔' },
  Frustrated: { level: 1, color: 'bg-[#ede0ff]', emoji: '😤' },
  Angry: { level: 1, color: 'bg-[#ffe0ef]', emoji: '😠' },
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient()

  // Get last 7 days start date
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: entries } = await supabase
    .from('mood_entries')
    .select('mood, created_at')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  if (!entries || entries.length === 0) {
    return {
      weeklyCheckIns: 0,
      topEmotions: [],
      trendData: [],
      weeklyTrendPercentage: '0%',
    }
  }

  // 1. Calculate Weekly Check-ins (Unique days)
  const uniqueDays = new Set(
    entries.map(e => new Date(e.created_at).toDateString())
  )
  const weeklyCheckIns = uniqueDays.size

  // 2. Calculate Top Emotions
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalEntries = entries.length
  const topEmotions = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) // Top 4
    .map(([mood, count]) => {
      const percentage = Math.round((count / totalEntries) * 100)
      const config = moodConfig[mood] || { color: 'bg-gray-100', emoji: '❓' }
      
      // Map brand colors to emotions for the UI
      let uiColor = 'bg-[#f3e3f8]'
      if (mood === 'Happy' || mood === 'Excited') uiColor = 'bg-[#fff1cc]'
      if (mood === 'Calm' || mood === 'Neutral') uiColor = 'bg-[#b7e4c7]'
      if (mood === 'Sad' || mood === 'Tired') uiColor = 'bg-[#a3b2f8]'
      if (mood === 'Angry' || mood === 'Frustrated') uiColor = 'bg-[#fed0bb]'

      return {
        name: mood,
        percentage: `${percentage}%`,
        color: uiColor,
        emoji: config.emoji,
      }
    })

  // 3. Calculate Trend Data (Last 7 days aligned to Mon-Sun format)
  // Group by day of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const latestByDay = new Map<string, any>()
  
  entries.forEach(entry => {
    const d = new Date(entry.created_at)
    // Overwrite with latest entry for that day
    latestByDay.set(dayNames[d.getDay()], entry)
  })

  // Generate sequence of last 7 days ending on today
  const trendData = []
  const todayIdx = new Date().getDay()
  for (let i = 6; i >= 0; i--) {
    const dayIdx = (todayIdx - i + 7) % 7
    const dayName = dayNames[dayIdx]
    const entry = latestByDay.get(dayName)
    
    if (entry) {
      trendData.push({
        day: dayName,
        level: moodConfig[entry.mood]?.level || 3,
        label: entry.mood,
        highlight: i === 0, // Highlight today
      })
    } else {
      trendData.push({
        day: dayName,
        level: 0,
        label: '',
        highlight: i === 0,
      })
    }
  }

  // 4. Calculate overall positive trend percentage (Level 4 or 5)
  const positiveCount = entries.filter(e => (moodConfig[e.mood]?.level || 0) >= 4).length
  const weeklyTrendPercentage = `${Math.round((positiveCount / Math.max(totalEntries, 1)) * 100)}% Positive`

  return {
    weeklyCheckIns,
    topEmotions,
    trendData,
    weeklyTrendPercentage,
  }
}
