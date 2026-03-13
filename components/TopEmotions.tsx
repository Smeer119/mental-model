export default function TopEmotions() {
  const emotions = [
    { name: "Excited", percentage: "75%", color: "bg-[#a3b2f8]" },
    { name: "Calm", percentage: "68%", color: "bg-[#b7e4c7]" },
    { name: "Neutral", percentage: "54%", color: "bg-[#fed0bb]" },
    { name: "Overwhelmed", percentage: "32%", color: "bg-[#e899dc]" },
  ];

  return (
    <div className="flex-1 bg-[#f3e3f8] rounded-[2rem] p-6 flex flex-col">
      <h3 className="text-gray-900 font-semibold mb-4 text-lg">Top emotions</h3>
      <div className="space-y-3">
        {emotions.map((emotion) => (
          <div key={emotion.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${emotion.color} flex items-center justify-center`}>
                <span className="text-xs">😊</span>
              </div>
              <span className="text-gray-800 font-medium text-sm">{emotion.name}</span>
            </div>
            <span className="text-gray-900 font-semibold text-sm">{emotion.percentage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
