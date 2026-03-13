import { Bell } from "lucide-react";

interface HeaderProps {
  profilePhoto?: string;
  fullName?: string;
}

export default function Header({ profilePhoto, fullName = "User" }: HeaderProps) {
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
      <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-gray-50 transition-colors">
        <Bell className="h-5 w-5 text-gray-800" strokeWidth={2.5} />
        <span className="absolute top-3 right-3 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
      </button>
    </header>
  );
}
