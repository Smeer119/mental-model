export default function WeeklyReflection() {
  return (
    <div className="bg-[#e3f5d8] rounded-[2rem] p-6 border border-[#cde8b7]">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-white/60 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
          🌿
        </div>
        <div>
          <h3 className="text-gray-900 font-bold text-base mb-2">Weekly Reflection</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            Your emotional pattern this week shows steady improvement.{' '}
            <span className="font-semibold text-gray-900">Deep breathing</span> had the highest
            impact on your calm scores.
          </p>
        </div>
      </div>
    </div>
  )
}
