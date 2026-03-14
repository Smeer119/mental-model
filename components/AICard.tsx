import Link from "next/link";

export default function AICard() {
  return (
    <Link href="/chat" className="block mx-6 mb-4 relative overflow-hidden rounded-[2rem] bg-[#e6e2ea] p-5 shadow-sm active:scale-[0.98] transition-transform">
      <div className="flex items-center space-x-4">
        {/* Mascot Logo Icon */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#cbbcf6]">
          <img 
            src="/mascot.png" 
            alt="Finn" 
            className="w-10 h-10 object-contain" 
          />
        </div>
        
        <div className="pr-12">
          <h3 className="text-base font-semibold text-gray-900 mb-0.5">
            Talk to Mindcore AI
          </h3>
          <p className="text-xs text-gray-600 leading-snug">
            Clear your mind and find inner peace with our calming practices.
          </p>
        </div>
      </div>

      {/* Abstract Right Graphic */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-80 mix-blend-multiply">
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 0L52.5 40L100 50L52.5 60L50 100L47.5 60L0 50L47.5 40L50 0Z"
            fill="#a64fca"
          />
          <path
            d="M85.355 14.645L61.611 41.611L85.355 85.355L61.611 58.389L14.645 85.355L38.389 58.389L14.645 14.645L38.389 41.611L85.355 14.645Z"
            fill="#a64fca"
            style={{ transformOrigin: "center", transform: "rotate(45deg)" }}
          />
        </svg>
      </div>
    </Link>
  );
}
