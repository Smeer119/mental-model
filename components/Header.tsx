'use client'

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface HeaderProps {
  profilePhoto?: string;
  fullName?: string;
}

export default function Header({ profilePhoto, fullName = "User" }: HeaderProps) {
  const [hasUnread, setHasUnread] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setHasUnread((count ?? 0) > 0);
    };

    checkUnread();

    const channel = supabase
      .channel('header_notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => setHasUnread(true))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, checkUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <header className="flex items-center justify-between pt-12 pb-6 px-6">
      {/* Avatar portrait */}
      <div className="relative h-12 w-12 rounded-xl bg-[#b3a1f8] overflow-hidden flex-shrink-0 shadow-sm border border-white/20">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={fullName}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-purple-200 flex items-center justify-center text-xl font-bold text-purple-600 uppercase">
            {fullName.charAt(0)}
          </div>
        )}
      </div>

      {/* Notification Icon */}
      <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-gray-50 transition-colors group">
        <Bell className="h-5 w-5 text-gray-800 group-active:scale-90 transition-transform" strokeWidth={2.5} />
        {hasUnread && (
          <span className="absolute top-3.5 right-3.5 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        )}
      </button>
    </header>
  );
}
