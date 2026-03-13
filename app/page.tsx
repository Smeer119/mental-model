import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import MoodSelector from "@/components/MoodSelector";
import HeroCard from "@/components/HeroCard";
import AICard from "@/components/AICard";
import EnergySection from "@/components/EnergySection";
import BottomNav from "@/components/BottomNav";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get first name only (e.g. "Veeresh Hindiholi" → "Veeresh")
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const firstName = fullName.split(' ')[0];

  return (
    <>
    <div className="pb-24">
      <Header />
      
      <div className="px-6 mb-5">
        <h1 className="text-[1.65rem] text-gray-900 font-medium leading-tight">
          Hi {firstName},
        </h1>
        <p className="text-[1.65rem] text-gray-500 font-light mt-0.5 tracking-tight leading-tight">
          How are you feeling today?
        </p>
      </div>

      <MoodSelector />
      <HeroCard />
      <AICard />
      <EnergySection />
      
      <BottomNav />
    </div>
    </>
  );
}
