import MoodTrendChart from "@/components/MoodTrendChart";
import WeeklyCheckIn from "@/components/WeeklyCheckIn";
import TopEmotions from "@/components/TopEmotions";
import WeeklyReflection from "@/components/WeeklyReflection";
import BottomNav from "@/components/BottomNav";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserStats } from "@/utils/userStats";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getUserStats(user.id);

  return (
    <div className="pb-28 min-h-screen bg-[#efebf0]">
      {/* Header */}
      <div className="pt-10 px-6 flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-0.5">Overview</p>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        </div>
        <button className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl shadow-sm text-sm font-semibold text-gray-700 border border-gray-100">
          This week
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Mood Emoji Row */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 w-fit">
          <span className="text-2xl">{stats.topEmotions[0]?.emoji || '😌'}</span>
          <div>
            <p className="text-xs text-gray-400 font-medium">Top mood</p>
            <p className="text-sm font-bold text-gray-800">{stats.topEmotions[0]?.name || 'Neutral'}</p>
          </div>
        </div>
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

      <BottomNav />
    </div>
  );
}
