import { Calendar } from "lucide-react";

export default function WeeklyCheckIn() {
  return (
    <div className="flex-1 bg-[#e0d9f7] rounded-[2rem] p-6 flex flex-col justify-between aspect-square">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
        <Calendar className="w-6 h-6 text-gray-900" />
      </div>
      <div>
        <p className="text-gray-900 font-medium mb-1">Weekly Check in</p>
        <div className="flex items-baseline">
          <span className="text-5xl font-semibold text-gray-900">6</span>
          <span className="text-2xl text-gray-500 font-medium ml-1">/7</span>
        </div>
      </div>
    </div>
  );
}
