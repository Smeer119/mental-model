import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import MoodSelector from "@/components/MoodSelector";
import WellnessRecommendations from "@/components/WellnessRecommendations";
import HeroCard from "@/components/HeroCard";
import AICard from "@/components/AICard";
import EnergySection from "@/components/EnergySection";
import BottomNav from "@/components/BottomNav";
import FinnTip from "@/components/FinnTip";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/onboarding');
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const firstName = fullName.split(' ')[0];
  const profilePhoto = user?.user_metadata?.avatar_url;

  // Fetch most recent mood entry (only if user is logged in)
  let lastMood: string | null = null;
  if (user?.id) {
    const { data: lastEntry } = await supabase
      .from('mood_entries')
      .select('mood')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();  // won't error if no rows found
    lastMood = lastEntry?.mood ?? null;
  }

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

      <MoodSelector lastMood={lastMood} />
      
      <FinnTip tip="Slow deep breaths can lower your heart rate in less than 60 seconds. Want to try a quick game?" />
      <div className="mt-4 mb-2">
        <h2 className="px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily Tips</h2>
        <WellnessRecommendations />
      </div>
      <HeroCard />
      <AICard />
      <EnergySection />
      
      {/* Bottom Logo */}
      <div className="mt-12 mb-12 flex justify-center px-6">
        <img 
          src="/bottom-logo.png" 
          alt="Brand Logo" 
          className="w-full max-w-[320px] opacity-80 hover:opacity-100 transition-opacity" 
        />
      </div>
      
      <BottomNav />
    </div>
    </>
  );
}
