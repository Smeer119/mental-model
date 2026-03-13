import { createClient } from './supabase/server'

export type ActivityEntry = {
  date: string // YYYY-MM-DD
  count: number
}

export type UserActivityStats = {
  streak: number
  lastActivityDate: string | null
  heatmapData: ActivityEntry[]
  recentBadges: Badge[]
  allBadges: Badge[]
  summaryCounts: {
    moods: number
    games: number
    assessments: number
  }
}

export type Badge = {
  id: string
  name: string
  description: string
  earnedAt: string
  color: string
}

export async function getUserActivity(userId: string): Promise<UserActivityStats> {
  const supabase = await createClient()

  // Fetch from all activity tables
  // We'll go back 6 months for the heatmap
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const startDate = sixMonthsAgo.toISOString()

  const [moods, games, assessments] = await Promise.all([
    supabase.from('mood_entries').select('created_at').eq('user_id', userId).gte('created_at', startDate),
    supabase.from('game_logs').select('timestamp, game_id').eq('user_id', userId).gte('timestamp', startDate),
    supabase.from('clinical_assessments').select('created_at').eq('user_id', userId).gte('created_at', startDate),
  ])

  // Combine and normalize dates to YYYY-MM-DD
  const activityDates = new Set<string>()
  const dateCounts: Record<string, number> = {}

  const processDates = (items: any[], key: string) => {
    if (!items) return
    items.forEach(item => {
      const date = new Date(item[key]).toISOString().split('T')[0]
      activityDates.add(date)
      dateCounts[date] = (dateCounts[date] || 0) + 1
    })
  }

  processDates(moods.data || [], 'created_at')
  processDates(games.data || [], 'timestamp')
  processDates(assessments.data || [], 'created_at')

  // Calculate Streak
  let streak = 0
  const sortedDates = Array.from(activityDates).sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let checkDate = today
  if (!activityDates.has(today) && activityDates.has(yesterday)) {
    checkDate = yesterday
  } else if (!activityDates.has(today)) {
    // Streak is broken or not started
    streak = 0
  }

  if (activityDates.has(checkDate)) {
    let current = new Date(checkDate)
    while (activityDates.has(current.toISOString().split('T')[0])) {
      streak++
      current.setDate(current.getDate() - 1)
    }
  }

  // Heatmap Data
  const heatmapData: ActivityEntry[] = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count
  }))

  // Calculate Real Badges based on data
  const badges: Badge[] = []
  const totalActivities = (moods.data?.length || 0) + (games.data?.length || 0) + (assessments.data?.length || 0)

  // 1. First Steps
  if (totalActivities >= 1) {
    badges.push({ id: 'badge_first_steps', name: 'First Steps', description: 'Your journey begins.', earnedAt: new Date().toISOString(), color: 'bg-emerald-500' })
  }
  // 2. Fire Starter
  if (streak >= 3) {
    badges.push({ id: 'badge_fire_starter', name: 'Fire Starter', description: '3 day streak reached!', earnedAt: new Date().toISOString(), color: 'bg-orange-500' })
  }
  // 3. Gamer
  if ((games.data?.length || 0) >= 3) {
    badges.push({ id: 'badge_gamer', name: 'Mindful Gamer', description: 'Played 3 mindfulness games.', earnedAt: new Date().toISOString(), color: 'bg-blue-500' })
  }
  // 4. Clinical Mind
  if ((assessments.data?.length || 0) >= 2) {
    badges.push({ id: 'badge_clinical', name: 'Clinical Mind', description: 'Completed 2 health screens.', earnedAt: new Date().toISOString(), color: 'bg-indigo-500' })
  }
  // 5. Steady Path 
  if (totalActivities >= 10) {
    badges.push({ id: 'badge_steady', name: 'Steady Path', description: 'Logged 10 mindfulness activities.', earnedAt: new Date().toISOString(), color: 'bg-purple-500' })
  }
  // 6. Zen Seeker
  const playedStones = games.data?.some(g => g.game_id === 'stones_01')
  if (playedStones) {
    badges.push({ id: 'badge_zen', name: 'Zen Seeker', description: 'Found balance in the Zen Stones game.', earnedAt: new Date().toISOString(), color: 'bg-stone-500' })
  }
  // 7. Mindful Master
  if (streak >= 7) {
    badges.push({ id: 'badge_master', name: 'Mindful Master', description: 'Incredible! 7 day streak.', earnedAt: new Date().toISOString(), color: 'bg-yellow-500' })
  }

  const recentBadges = badges.slice(-4) // Show most recent 4 in "recent" but we'll use full list in profile if needed


  // Calculate summary counts for the last 7 days (for rings)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString()

  const summaryCounts = {
    moods: (moods.data || []).filter(m => m.created_at >= sevenDaysAgoStr).length,
    games: (games.data || []).filter(g => g.timestamp >= sevenDaysAgoStr).length,
    assessments: (assessments.data || []).filter(a => a.created_at >= sevenDaysAgoStr).length,
  }

  return {
    streak,
    lastActivityDate: sortedDates[0] || null,
    heatmapData,
    recentBadges: recentBadges,
    allBadges: badges,
    summaryCounts
  }
}
