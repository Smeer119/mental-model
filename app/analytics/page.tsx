import MoodTrendChart from "@/components/MoodTrendChart";
import WeeklyCheckIn from "@/components/WeeklyCheckIn";
import TopEmotions from "@/components/TopEmotions";
import WeeklyReflection from "@/components/WeeklyReflection";
import GamesActivity from "@/components/GamesActivity";
import BottomNav from "@/components/BottomNav";
import ClinicalHistoryChart from "@/components/ClinicalHistoryChart";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserStats } from "@/utils/userStats";
import { getUserActivity } from "@/utils/activity";
import AnalyticsTimeToggle from "@/components/AnalyticsTimeToggle";
import MindfulnessRings from "@/components/MindfulnessRings";

export default async function AnalyticsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const timeRange = typeof searchParams.timeRange === 'string' ? searchParams.timeRange : 'week';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [stats, activity, { data: assessments }] = await Promise.all([
    getUserStats(user.id, timeRange),
    getUserActivity(user.id),
    supabase
      .from('clinical_assessments')
      .select('id, created_at, total_score, assessment_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  return (
    <div className="pb-28 min-h-screen bg-[#efebf0]">
      {/* Header */}
      <div className="pt-10 px-6 flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-0.5">Overview</p>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        </div>
        <AnalyticsTimeToggle />
      </div>

      {/* Mindfulness Habit Rings */}
      <div className="px-6 mb-4">
        <MindfulnessRings 
           moods={activity.summaryCounts.moods}
           games={activity.summaryCounts.games}
           assessments={activity.summaryCounts.assessments}
        />
      </div>

      {/* Mood Trend Chart */}
      <div className="px-6 mb-4">
        <MoodTrendChart 
          trendData={stats.trendData} 
          weeklyTrendPercentage={stats.weeklyTrendPercentage} 
        />
      </div>

      {/* Weekly Check-in + Top Emotions side by side */}
      <div className="px-6 mb-4 flex gap-4">
        <WeeklyCheckIn daysLogged={stats.weeklyCheckIns} />
        <TopEmotions emotions={stats.topEmotions} />
      </div>

      {/* Weekly Reflection */}
      <div className="px-6 mb-4">
        <WeeklyReflection />
      </div>

      {/* Clinical Assessment History */}
      <div className="px-6 mb-4 space-y-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Clinical History</h2>
        </div>
        <ClinicalHistoryChart data={assessments || []} type="PHQ9" />
        <ClinicalHistoryChart data={assessments || []} type="GAD7" />
      </div>

      {/* Games Activity */}
      <div className="px-6 mb-4">
        <GamesActivity />
      </div>

      <BottomNav />
    </div>
  );
}
