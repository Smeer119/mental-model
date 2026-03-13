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

export async function getUserStats(userId: string, timeRange: string = 'week'): Promise<UserStats> {
  const supabase = await createClient()

  // Calculate start date based on timeRange
  const startDate = new Date()
  let daysToFetch = 7
  if (timeRange === 'day') Object.assign(startDate, new Date()) // Will only fetch today
  if (timeRange === 'week') daysToFetch = 7
  if (timeRange === 'month') daysToFetch = 30

  startDate.setDate(startDate.getDate() - daysToFetch + 1)
  startDate.setHours(0, 0, 0, 0)

  const { data: entries } = await supabase
    .from('mood_entries')
    .select('mood, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
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

  // 3. Calculate Trend Data
  const trendData = []
  
  if (timeRange === 'day') {
    // For today, show chronological entries by hour
    const todayEntries = entries.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
    
    // Show up to 7 most recent entries today
    const recentToday = todayEntries.slice(-7)
    
    recentToday.forEach((entry, i) => {
      const d = new Date(entry.created_at)
      trendData.push({
        day: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: moodConfig[entry.mood]?.level || 3,
        label: entry.mood,
        highlight: i === recentToday.length - 1,
      })
    })

    // Pad if empty
    if (trendData.length === 0) {
      trendData.push({ day: 'Now', level: 0, label: '', highlight: true })
    }
  } else {
    // Week or Month: group by days
    const latestByDay = new Map<string, any>()
    entries.forEach(entry => {
      const d = new Date(entry.created_at)
      // Key format: YYYY-MM-DD
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      latestByDay.set(key, entry)
    })

    for (let i = daysToFetch - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const entry = latestByDay.get(key)
      
      let dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      if (timeRange === 'month') {
        dayName = d.getDate().toString() // "1", "2"... "31"
      }

      trendData.push({
        day: dayName,
        level: entry ? (moodConfig[entry.mood]?.level || 3) : 0,
        label: entry ? entry.mood : '',
        highlight: i === 0, // Highlight today
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
