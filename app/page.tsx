import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import MoodSelector from "@/components/MoodSelector";
import WellnessRecommendations from "@/components/WellnessRecommendations";
import HeroCard from "@/components/HeroCard";
import AICard from "@/components/AICard";
import EnergySection from "@/components/EnergySection";
import BottomNav from "@/components/BottomNav";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const firstName = fullName.split(' ')[0];
  const profilePhoto = user?.user_metadata?.avatar_url;

  return (
    <>
    <div className="pb-24">
      <Header profilePhoto={profilePhoto} fullName={fullName} />
      
      <div className="px-6 mb-5">
        <h1 className="text-[1.65rem] text-gray-900 font-medium leading-tight">
          Hi {firstName},
        </h1>
        <p className="text-[1.65rem] text-gray-500 font-light mt-0.5 tracking-tight leading-tight">
          How are you feeling today?
        </p>
      </div>

      <MoodSelector />
      
      <div className="mt-4 mb-2">
        <h2 className="px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily Tips</h2>
        <WellnessRecommendations />
      </div>

      <HeroCard />
      <AICard />
      <EnergySection />
      
      <BottomNav />
    </div>
    </>
  );
}
