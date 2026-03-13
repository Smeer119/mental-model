import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import WeeklyCheckIn from "@/components/WeeklyCheckIn";
import TopEmotions from "@/components/TopEmotions";
import BottomNav from "@/components/BottomNav";
import { LogOut, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profilePhoto = user.user_metadata.avatar_url;
  const fullName = user.user_metadata.full_name || "User";
  const email = user.email;

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="pb-24 min-h-screen bg-[#efebf0]">
      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between mb-8">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <form action={handleLogout}>
          <button type="submit" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors group">
            <LogOut className="w-5 h-5 text-gray-900 group-hover:text-red-500 transition-colors" />
          </button>
        </form>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center px-6 mb-10">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {profilePhoto ? (
              <img src={profilePhoto} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-purple-200 flex items-center justify-center text-3xl font-bold text-purple-600">
                {fullName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#714efe] rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h2>
        <p className="text-gray-500 font-medium">{email}</p>
      </div>

      {/* Stats Cards Section */}
      <div className="px-6 space-y-4">
        <div className="flex space-x-4">
          <WeeklyCheckIn />
          <TopEmotions />
        </div>

        {/* Placeholder for more settings/stats */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-white">
          <h3 className="text-gray-900 font-semibold mb-3">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-700 font-medium">Notifications</span>
              <div className="w-12 h-6 bg-green-400 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50 font-medium text-gray-700">
              <span>Privacy Mode</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
