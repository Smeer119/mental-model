export type EmotionStat = {
  name: string
  percentage: string
  color: string
  emoji: string
}

interface TopEmotionsProps {
  emotions: EmotionStat[]
}

export default function TopEmotions({ emotions = [] }: TopEmotionsProps) {
  return (
    <div className="flex-1 bg-[#f3e3f8] rounded-[2rem] p-6 flex flex-col">
      <h3 className="text-gray-900 font-semibold mb-4 text-lg">Top emotions</h3>
      <div className="space-y-3">
        {emotions.length === 0 ? (
          <p className="text-gray-500 text-sm">No moods logged yet this week.</p>
        ) : (
          emotions.map((emotion) => (
            <div key={emotion.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${emotion.color} flex items-center justify-center`}>
                  <span className="text-xs">{emotion.emoji}</span>
                </div>
                <span className="text-gray-800 font-medium text-sm">{emotion.name}</span>
              </div>
              <span className="text-gray-900 font-semibold text-sm">{emotion.percentage}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
