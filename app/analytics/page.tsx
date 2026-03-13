import MoodTrendChart from "@/components/MoodTrendChart";
import WeeklyCheckIn from "@/components/WeeklyCheckIn";
import TopEmotions from "@/components/TopEmotions";
import WeeklyReflection from "@/components/WeeklyReflection";
import GamesActivity from "@/components/GamesActivity";
import BottomNav from "@/components/BottomNav";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
          <span className="text-2xl">😌</span>
          <div>
            <p className="text-xs text-gray-400 font-medium">Current mood</p>
            <p className="text-sm font-bold text-gray-800">Calm & Present</p>
          </div>
        </div>
      </div>

      {/* Mood Trend Chart */}
      <div className="px-6 mb-4">
        <MoodTrendChart />
      </div>

      {/* Weekly Check-in + Top Emotions side by side */}
      <div className="px-6 mb-4 flex gap-4">
        <WeeklyCheckIn />
        <TopEmotions />
      </div>

      {/* Weekly Reflection */}
      <div className="px-6 mb-4">
        <WeeklyReflection />
      </div>

      {/* Games Activity */}
      <div className="px-6 mb-4">
        <GamesActivity />
      </div>

      <BottomNav />
    </div>
  );
}
