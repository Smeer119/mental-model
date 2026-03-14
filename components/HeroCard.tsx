import Link from "next/link";
import { Play } from "lucide-react";

export default function HeroCard() {
  return (
    <div className="mx-6 mb-4 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#714efe] to-[#997cff] p-7 shadow-lg">
      <div className="relative z-10 w-2/3">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">I'm Finn.</h2>
        <p className="text-white/80 text-[15px] leading-snug mb-5 font-medium pr-4">
          Let's get started with a quick mood check.
        </p>
        <Link href="/chat">
          <button className="flex items-center space-x-2 bg-white text-[#714efe] px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
            <span>Check in</span>
            <Play fill="currentColor" className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Using mascot.png instead of CSS blob */}
      <div className="absolute right-[-10px] -bottom-4 w-44 h-44 z-0 flex items-center justify-center">
        {/* Glow behind Finn */}
        <div className="absolute w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
        <img 
          src="/mascot.png" 
          alt="Finn Mascot" 
          className="relative z-10 w-40 h-40 object-contain drop-shadow-xl" 
        />
      </div>
    </div>
  );
}
